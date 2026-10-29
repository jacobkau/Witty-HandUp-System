import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
