import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 chars']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    enum: ['errands', 'repairs', 'education', 'donations', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'claimed', 'completed'],
    default: 'open'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere' 
    },
    address: String
  },
  deadline: Date,
  requester: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
   isRated: {
    type: Boolean,
    default: false
  },
  helper: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Create geospatial index
taskSchema.index({ location: '2dsphere' });

const Task = mongoose.model('Task', taskSchema);
export default Task;
