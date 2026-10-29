import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  helper: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['errands', 'repairs', 'education', 'donations', 'cleaning', 'tech', 'delivery', 'events', 'other'],
    required: true
  },
  status: { type: String, enum: ['open', 'claimed', 'completed'], default: 'open' },
  isUrgent: { type: Boolean, default: false },
  price: { type: Number, required: true, min: 0 },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true, index: '2dsphere' },
    address: String
  },
  deadline: Date,
  requester: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  helper: { type: mongoose.Schema.ObjectId, ref: 'User' },
  bids: [bidSchema],
  isRated: { type: Boolean, default: false },
  ratingValue: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

taskSchema.index({ location: '2dsphere' });
export default mongoose.model('Task', taskSchema);
