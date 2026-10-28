import Task from "../models/Task.js";
import { getIO } from "../sockets/socket.js";
import { sendEmail } from "../utils/sendEmail.js";

export const getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    // 1. Build the base query 
    let query = {};
    if (req.query.admin === 'true') {
      if (req.query.status) query.status = req.query.status;
    } else {
      query.status = req.query.status || { $ne: "completed" };
    }

    // 2. Add Category Filtering
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // 3. Add Text Search 
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } }, 
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // 4. Add Location Filtering
    if (req.query.longitude && req.query.latitude) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(req.query.longitude), parseFloat(req.query.latitude)],
          },
          $maxDistance: 10000,
        },
      };
    }

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate("requester", "name email phone")
      .populate("helper", "name email phone")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ 
      success: true, 
      count: tasks.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: tasks 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// @desc    Create a task
// @route   POST /api/tasks
export const createTask = async (req, res) => {
  const { title, description, category, location, deadline } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const task = await Task.create({
      title,
      description,
      category,
      location,
      deadline,
      requester: req.user.id,
      createdBy: req.user.id,
      status: "open",
    });

    const populatedTask = await Task.findById(task._id).populate("requester", "name");
    
    const io = getIO();
    io.emit("new-task", populatedTask);

    res.status(201).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  const { title, description, category, location, deadline } = req.body;

  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, error: "Task not found" });

    const isOwner = task.requester.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: "Not authorized to update this task" });
    }

    if (task.status !== "open") {
      return res.status(400).json({ success: false, error: "Only open tasks can be updated" });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.category = category || task.category;
    task.location = location || task.location;
    task.deadline = deadline || task.deadline;

    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id)
      .populate("requester", "name email")
      .populate("helper", "name email")
      .populate("createdBy", "name");

    const io = getIO();
    io.emit("task-updated", populatedTask);

    res.status(200).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Claim a task
// @route   PUT /api/tasks/:id/claim
export const claimTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("requester", "name email")
      .populate("helper", "name")
      .populate("createdBy", "name");

    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (task.status !== "open") return res.status(400).json({ success: false, error: "Task already claimed/completed" });
    if (task.requester?._id.toString() === req.user.id) return res.status(400).json({ success: false, error: "You cannot claim your own task" });

    task.helper = req.user.id;
    task.status = "claimed";
    
    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id)
      .populate("requester", "name email")
      .populate("helper", "name email");

    // SEND EMAIL TO REQUESTER 
    if (populatedTask.requester?.email) {
      const emailText = `Hello ${populatedTask.requester.name},

Good news! Your task "${populatedTask.title}" has been claimed by ${populatedTask.helper.name}.

They will be in touch with you shortly at this email address (${populatedTask.requester.email}) to coordinate.

Thank you for using Witty HandUp!`;
      
      await sendEmail(populatedTask.requester.email, 'Your task has been claimed!', emailText);
    }

    const io = getIO();
    io.emit("task-claimed", populatedTask);

    res.status(200).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Complete a task
// @route   PUT /api/tasks/:id/complete
export const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("requester", "name email")
      .populate("helper", "name email");

    if (!task) return res.status(404).json({ success: false, error: "Task not found" });

    const isRequester = task.requester._id.toString() === req.user.id;
    const isHelper = task.helper && task.helper._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isRequester && !isHelper && !isAdmin) {
      return res.status(403).json({ success: false, error: "Not authorized to complete this task" });
    }

    task.status = "completed";
    const updatedTask = await task.save();

    // SEND EMAIL TO THE OTHER PARTY 
    if (isHelper && task.requester?.email) {
      const emailText = `Hello ${task.requester.name},

${task.helper.name} has marked the task "${task.title}" as completed.

Please log in to your dashboard to review and confirm.

Thank you for using Witty HandUp!`;
      
      await sendEmail(task.requester.email, 'Task Completed!', emailText);
      
    } else if ((isRequester || isAdmin) && task.helper?.email) {
      const emailText = `Hello ${task.helper.name},

${task.requester.name} has confirmed that the task "${task.title}" is complete.

Thank you for your help in the community!

Best regards,
The Witty HandUp Team`;
      
      await sendEmail(task.helper.email, 'Task Confirmed Complete', emailText);
    }

    const io = getIO();
    io.emit("task-completed", updatedTask);

    res.status(200).json({ success: true, data: updatedTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get user's tasks
// @route   GET /api/tasks/my-tasks
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [{ requester: req.user.id }, { helper: req.user.id }],
    })
      .populate("requester", "name email")
      .populate("helper", "name email")
      .populate("createdBy", "name");

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a task (Owner or Admin)
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, error: "Task not found" });

    const isOwner = task.requester.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: "Not authorized to delete this task" 
      });
    }

    await task.deleteOne();

    const io = getIO();
    io.emit("task-deleted", task._id);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
