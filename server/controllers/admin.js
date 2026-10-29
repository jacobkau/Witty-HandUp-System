import User from '../models/User.js';
import Task from '../models/Task.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const activeTasks = await Task.countDocuments({ status: { $in: ['open', 'claimed'] } });
    
    const tasks = await Task.find({ status: { $ne: 'open' } });
    const totalVolume = tasks.reduce((acc, task) => acc + (task.price || 0), 0);

    res.status(200).json({
      success: true,
      data: { totalUsers, totalTasks, activeTasks, totalVolume }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role walletBalance rating numReviews createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
