import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { initSocket } from './sockets/socket.js'; 
import messageRoutes from './routes/messages.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  'https://wittyhandupsystem.vercel.app',
  'https://wittyhandupsystem-k56r3kyf7-jacobkaus-projects.vercel.app',
  'https://wittyhandupsystem-git-main-jacobkaus-projects.vercel.app',
  process.env.CLIENT_ORIGIN,
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('HandUp Server is Running');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Server error' 
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

initSocket(server);
