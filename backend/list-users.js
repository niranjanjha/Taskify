import User from './models/userModel.js';
import { connectDB } from './config/db.js';
import mongoose from 'mongoose';
import 'dotenv/config';

const listUsers = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // List all users
    const users = await User.find({});
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user._id}`);
    });
    
    console.log(`Total users: ${users.length}`);
    
    // Close the connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

listUsers();