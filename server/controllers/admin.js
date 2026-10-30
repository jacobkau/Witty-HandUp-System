import User from '../models/User.js';
import Task from '../models/Task.js';

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const activeTasks = await Task.countDocuments({ status: { $in: ['open', 'claimed'] } });
    const tasks = await Task.find({ status: { $ne: 'open' } });
    const totalVolume = tasks.reduce((acc, task) => acc + (task.price || 0), 0);

    res.status(200).json({ success: true, data: { totalUsers, totalTasks, activeTasks, totalVolume } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
export const getReportedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ isReported: true })
      .populate('requester', 'name email')
      .populate('helper', 'name email')
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Resolve report
export const resolveReport = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });

    task.isReported = false;
    task.reportReason = null;
    await task.save();
    
    res.status(200).json({ success: true, message: "Report resolved" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role walletBalance rating numReviews isActive createdAt')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Toggle User Status
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, error: 'Cannot deactivate an admin' });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

//  Delete User
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, error: 'Cannot delete an admin' });

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
