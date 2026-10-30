import Task from "../models/Task.js";
import User from "../models/User.js";
import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/sendEmail.js';
import { getIO } from '../sockets/socket.js'; 

export const getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    let query = {};
    
    // Status filter
    if (req.query.status === 'claimed') {
      query.status = { $in: ['claimed', 'work_completed', 'awaiting_verification'] };
    } else if (req.query.status) {
      query.status = req.query.status;
    } else {
      query.status = { $ne: "completed" };
    }

    // Category filter
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Search filter
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } }, 
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.bidsOnly === 'true') {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "You must be logged in" });
      }
      query['bids.helper'] = req.user.id;
    }

    // MINE filter 
    if (req.query.mine === 'true') {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "You must be logged in" });
      }
      query.$and = [
        { 
          $or: [
            { requester: req.user.id }, 
            { helper: req.user.id }
          ] 
        }
      ];
    }

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate("requester", "name email phone rating numReviews")
      .populate("helper", "name email phone rating numReviews")
      .populate("bids.helper", "name rating numReviews")
      .sort({ isUrgent: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, total, totalPages: Math.ceil(total / limit), currentPage: page, data: tasks });
  } catch (err) {
    console.error("Get Tasks Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createTask = async (req, res) => {
  const { title, description, category, location, deadline, price, isUrgent } = req.body;
  try {
    const task = await Task.create({
      title, description, category, location, deadline, price, isUrgent,
      requester: req.user.id,
      status: "open"
    });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const placeBid = async (req, res) => {
  try {
    const { amount, message } = req.body;
    const task = await Task.findById(req.params.id).populate('requester', 'name email');
    
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (task.status !== "open") return res.status(400).json({ success: false, error: "Task is no longer open" });
    if (task.requester._id.toString() === req.user.id) return res.status(400).json({ success: false, error: "You cannot bid on your own task" });

    const existingBid = task.bids.find(b => b.helper.toString() === req.user.id);
    if (existingBid) {
      existingBid.amount = amount;
      existingBid.message = message;
    } else {
      task.bids.push({ helper: req.user.id, amount, message });
    }

    await task.save({ validateModifiedOnly: true });

    await Notification.create({
      recipient: task.requester._id,
      sender: req.user.id,
      task: task._id,
      type: 'new_bid',
      message: `New bid of KES ${amount} placed on your task "${task.title}".`,
    });

    // Socket for real-time browser notification
    const io = getIO();
    io.emit(`notification-${task.requester._id}`, { message: `New bid of KES ${amount} on "${task.title}"` });

    try {
      const bidder = await User.findById(req.user.id);
      await sendEmail(
        task.requester.email, 
        'New Bid Received on Witty HandUp', 
        `Hello ${task.requester.name},\n\n${bidder.name} has placed a bid of KES ${amount} on your task: "${task.title}".\n\nLog in to view the bid and accept it.\n\nBest regards,\nWitty HandUp Team`
      );
    } catch (emailErr) { console.error("Email failed:", emailErr); }

    const populatedTask = await Task.findById(task._id)
      .populate("requester", "name email phone rating numReviews")
      .populate("bids.helper", "name rating numReviews");

    res.status(200).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const acceptBid = async (req, res) => {
  try {
    const { bidId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (task.requester.toString() !== req.user.id) return res.status(403).json({ success: false, error: "Only the creator can accept bids" });
    if (task.status !== "open") return res.status(400).json({ success: false, error: "Task already claimed" });

    const bid = task.bids.id(bidId);
    if (!bid) return res.status(404).json({ success: false, error: "Bid not found" });

    task.helper = bid.helper;
    task.price = bid.amount; 
    task.status = "claimed";
    await task.save();

    await Notification.create({
      recipient: bid.helper,
      sender: req.user.id,
      task: task._id,
      type: 'bid_accepted',
      message: `Your bid of KES ${bid.amount} was accepted for "${task.title}".`,
    });

    const io = getIO();
    io.emit(`notification-${bid.helper}`, { message: `Your bid was accepted for "${task.title}"!` });

    try {
      const helper = await User.findById(bid.helper);
      await sendEmail(helper.email, 'Your Bid Was Accepted! - Witty HandUp', `Hello ${helper.name},\n\nYour bid of KES ${bid.amount} was accepted for: "${task.title}".\n\nLog in to coordinate.`);
    } catch (emailErr) { console.error("Email failed:", emailErr); }

    const populatedTask = await Task.findById(task._id)
      .populate("requester", "name email phone")
      .populate("helper", "name email phone rating numReviews");

    res.status(200).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const markWorkCompleted = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (!task.helper || task.helper.toString() !== req.user.id) return res.status(403).json({ success: false, error: "Only the helper can mark work as done" });
    if (task.status !== "claimed") return res.status(400).json({ success: false, error: "Task is not in claimed state" });

    task.status = "work_completed";
    await task.save();

    await Notification.create({
      recipient: task.requester,
      sender: req.user.id,
      task: task._id,
      type: 'payment_submitted',
      message: `The helper has completed the work for "${task.title}". Please pay to proceed.`,
    });

    const io = getIO();
    io.emit(`notification-${task.requester}`, { message: `Work completed for "${task.title}". Please pay.` });

    const populatedTask = await Task.findById(task._id)
      .populate("requester", "name email phone rating numReviews")
      .populate("helper", "name email phone rating numReviews")
      .populate("bids.helper", "name rating numReviews");

    res.status(200).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const submitPayment = async (req, res) => {
  try {
    const { paymentCode } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (task.requester.toString() !== req.user.id) return res.status(403).json({ success: false, error: "Only the creator can submit payment" });
    if (task.status !== "work_completed") return res.status(400).json({ success: false, error: "Helper must mark work as done first" });

    task.paymentCode = paymentCode;
    task.status = "awaiting_verification"; 
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("requester", "name email phone rating numReviews")
      .populate("helper", "name email phone rating numReviews")
      .populate("bids.helper", "name rating numReviews");

    res.status(200).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (task.helper.toString() !== req.user.id) return res.status(403).json({ success: false, error: "Only the helper can confirm payment" });
    if (task.status !== "awaiting_verification") return res.status(400).json({ success: false, error: "No pending payment to confirm" });

    task.status = "completed";
    task.isPaid = true;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("requester", "name email phone rating numReviews")
      .populate("helper", "name email phone rating numReviews")
      .populate("bids.helper", "name rating numReviews");

    res.status(200).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const rateTask = async (req, res) => {
  try {
    const { rating } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (task.status !== "completed") return res.status(400).json({ success: false, error: "Task must be completed first" });
    if (task.requester.toString() !== req.user.id) return res.status(403).json({ success: false, error: "Only the creator can rate" });

    const helper = await User.findById(task.helper);
    const newNumReviews = helper.numReviews + 1;
    helper.rating = ((helper.rating * helper.numReviews) + rating) / newNumReviews;
    helper.numReviews = newNumReviews;
    await helper.save();

    task.isRated = true;
    task.ratingValue = rating;
    await task.save();

    res.status(200).json({ success: true, message: "Rating submitted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    
    const isOwner = task.requester.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, error: "Not authorized" });
    if (task.status !== "open") return res.status(400).json({ success: false, error: "Only open tasks can be updated" });

    const { title, description, category, location, deadline, price, isUrgent } = req.body;
    task.title = title || task.title;
    task.description = description || task.description;
    task.category = category || task.category;
    task.location = location || task.location;
    task.deadline = deadline || task.deadline;
    task.price = price !== undefined ? price : task.price;
    task.isUrgent = isUrgent !== undefined ? isUrgent : task.isUrgent;

    await task.save();
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });

    const isOwner = task.requester.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, error: "Not authorized" });

    await task.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ $or: [{ requester: req.user.id }, { helper: req.user.id }] })
      .populate("requester", "name email")
      .populate("helper", "name email");
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Cancel Bid
export const cancelBid = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (task.status !== "open") return res.status(400).json({ success: false, error: "Cannot cancel bid on a claimed task" });

    task.bids = task.bids.filter(b => b.helper.toString() !== req.user.id);
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("requester", "name email phone rating numReviews")
      .populate("bids.helper", "name rating numReviews");

    res.status(200).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Report Requester
export const reportTask = async (req, res) => {
  try {
    const { reason } = req.body;
    const task = await Task.findById(req.params.id).populate('requester', 'name email');
    
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (task.helper.toString() !== req.user.id) return res.status(403).json({ success: false, error: "Only the helper can report this task" });
    if (task.status !== "work_completed") return res.status(400).json({ success: false, error: "Can only report if work is completed but not paid" });

    task.isReported = true;
    task.reportReason = reason || "Requester refused to pay after work completion.";
    await task.save();

    try {
      await sendEmail(
        task.requester.email,
        'URGENT: Payment Pending - Witty HandUp',
        `Hello ${task.requester.name},\n\nYou have an unpaid task: "${task.title}".\nThe helper has reported that you have not paid for the completed work.\n\nPlease log in and submit the payment code immediately to avoid account suspension.\n\nBest regards,\nAdmin Team`
      );
    } catch (emailErr) { console.error("Email failed:", emailErr); }

    res.status(200).json({ success: true, message: "Report submitted and requester notified." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
