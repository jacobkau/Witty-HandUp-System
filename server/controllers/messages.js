import Message from '../models/Message.js';
import Task from '../models/Task.js';
import { getIO } from '../sockets/socket.js';

// @desc    Get all messages for a specific task
// @route   GET /api/messages/:taskId
export const getMessages = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    const isRequester = task.requester.toString() === req.user.id;
    const isHelper = task.helper && task.helper.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isRequester && !isHelper && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this chat' });
    }

    const messages = await Message.find({ task: req.params.taskId })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 }); 

    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages/:taskId
export const sendMessage = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    const isRequester = task.requester.toString() === req.user.id;
    const isHelper = task.helper && task.helper.toString() === req.user.id;
    
    if (!isRequester && !isHelper) {
      return res.status(403).json({ success: false, error: 'Not authorized to send messages here' });
    }

    const message = await Message.create({
      task: req.params.taskId,
      sender: req.user.id,
      text: req.body.text
    });

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name role');

    const io = getIO();
    io.emit(`new-message-${req.params.taskId}`, populatedMessage);

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
