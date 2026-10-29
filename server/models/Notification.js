import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.ObjectId, ref: 'Task', required: true },
  type: { type: String, enum: ['new_bid', 'bid_accepted', 'payment_submitted', 'payment_confirmed'], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: { type: String } 
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
