import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const makeAdmins = async (emails) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    for (const email of emails) {
      const user = await User.findOneAndUpdate(
        { email: email.toLowerCase() }, 
        { role: 'admin' },
        { new: true }
      );

      if (user) {
        console.log(`✅ Success! ${user.name} (${user.email}) is now an Admin.`);
      } else {
        console.log(`❌ User with email ${email} not found.`);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

// Add as many emails as you want here
const adminEmails = [
  'kaujacob4@gmail.com',
  'Wittyhighbrowtechnologies@gmail.com',
];

makeAdmins(adminEmails);
