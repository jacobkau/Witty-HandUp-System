import Task from "../models/Task.js";
import User from "../models/User.js";
import { getIO } from "../sockets/socket.js";
import { sendEmail } from "../utils/sendEmail.js";

export const getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.admin === 'true') {
      if (req.query.status) query.status = req.query.status;
    } else {
      query.status = req.query.status || { $ne: "completed" };
    }

    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } }, 
        { description: { $regex: req.query.search, $options: 'i' } }
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
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createTask = async (req, res) => {
  const { title, description, category, location, deadline, price, isUrgent } = req.body;

  try {
    if (isUrgent) {
      const activeUrgent = await Task.countDocuments({ 
        requester: req.user.id, 
        isUrgent: true, 
        status: { $ne: "completed" } 
      });
      if (activeUrgent >= 2) {
        return res.status(400).json({ success: false, error: "You can only have 2 active urgent tasks at a time." });
      }
    }

    const task = await Task.create({
      title, description, category, location, deadline, price, isUrgent,
      requester: req.user.id,
      status: "open"
    });

    const populatedTask = await Task.findById(task._id).populate("requester", "name");
    
    const io = getIO();
    io.emit("new-task", populatedTask); 
    
    const skilledUsers = await User.find({ skills: { $in: [category] } });
    skilledUsers.forEach(u => {
      io.emit(`skill-match-${u._id}`, { message: `New ${category} task: ${title}` });
    });

    res.status(201).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const placeBid = async (req, res) => {
  try {
    const { amount, message } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (task.status !== "open") return res.status(400).json({ success: false, error: "Task is no longer open" });
    if (task.requester.toString() === req.user.id) return res.status(400).json({ success: false, error: "You cannot bid on your own task" });

    const existingBid = task.bids.find(b => b.helper.toString() === req.user.id);
    if (existingBid) {
      existingBid.amount = amount;
      existingBid.message = message;
    } else {
      task.bids.push({ helper: req.user.id, amount, message });
    }

    await task.save({ validateModifiedOnly: true });

    const populatedTask = await Task.findById(task._id)
      .populate("requester", "name")
      .populate("bids.helper", "name rating numReviews");

    const io = getIO();
    io.emit("task-bid", populatedTask); 

    res.status(200).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const acceptBid = async (req, res) => {
  try {
    const { bidId } = req.body;
    const task = await Task.findById(req.params.id).populate("requester");

    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (task.requester._id.toString() !== req.user.id) return res.status(403).json({ success: false, error: "Only the creator can accept bids" });
    if (task.status !== "open") return res.status(400).json({ success: false, error: "Task already claimed/completed" });

    const bid = task.bids.id(bidId);
    if (!bid) return res.status(404).json({ success: false, error: "Bid not found" });

    if (task.requester.walletBalance < bid.amount) {
      return res.status(400).json({ success: false, error: "Insufficient wallet balance to accept this bid." });
    }

    task.requester.walletBalance -= bid.amount;
    await task.requester.save();

    task.helper = bid.helper;
    task.price = bid.amount; 
    task.status = "claimed";
    
    await task.save();
    const populatedTask = await Task.findById(task._id)
      .populate("requester", "name email phone")
      .populate("helper", "name email phone rating numReviews");

    const io = getIO();
    io.emit("task-claimed", populatedTask);

    res.status(200).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("requester")
      .populate("helper");

    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (task.status !== "claimed") return res.status(400).json({ success: false, error: "Task is not in claimed state" });

    const isRequester = task.requester._id.toString() === req.user.id;
    const isHelper = task.helper && task.helper._id.toString() === req.user.id;

    if (!isRequester && !isHelper) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    task.status = "completed";
    
    const helper = await User.findById(task.helper._id);
    helper.walletBalance += task.price;
    await helper.save();

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("requester", "name email phone")
      .populate("helper", "name email phone rating numReviews");

    const io = getIO();
    io.emit("task-completed", populatedTask);

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
    if (task.isRated) return res.status(400).json({ success: false, error: "Task already rated" });
    if (task.requester.toString() !== req.user.id) return res.status(403).json({ success: false, error: "Only the creator can rate" });

    const helper = await User.findById(task.helper);
    if (!helper) return res.status(404).json({ success: false, error: "Helper not found" });

    const newNumReviews = helper.numReviews + 1;
    const newRating = ((helper.rating * helper.numReviews) + rating) / newNumReviews;

    helper.rating = newRating;
    helper.numReviews = newNumReviews;
    await helper.save();

    task.isRated = true;
    task.ratingValue = rating;
    await task.save();

    // Return the fully populated task so the frontend updates immediately
    const populatedTask = await Task.findById(task._id)
      .populate("requester", "name email phone rating numReviews")
      .populate("helper", "name email phone rating numReviews");

    res.status(200).json({ success: true, message: "Rating submitted successfully", data: populatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (task.requester.toString() !== req.user.id) return res.status(403).json({ success: false, error: "Not authorized" });
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
    if (task.requester.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }
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
