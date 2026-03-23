import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Task from './models/taskModel.js';
import userModel from './models/userModel.js';
import { sendTaskAssignmentEmail } from './services/taskAssignmentEmailService.js';
import { initializeTransporter } from './services/emailService.js';

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

// Test with real transporter initialization like in server
async function testRealAssignment() {
  await connectDB();
  
  try {
    console.log('Initializing transporter like in server...');
    initializeTransporter();
    
    // Create test users if they don't exist
    let owner = await userModel.findOne({ email: 'owner@example.com' });
    if (!owner) {
      owner = new userModel({
        name: 'Rajesh Kumar',
        email: 'owner@example.com',
        password: 'password123'
      });
      await owner.save();
      console.log('Created owner user');
    }
    
    let assignee = await userModel.findOne({ email: 'assignee@example.com' });
    if (!assignee) {
      assignee = new userModel({
        name: 'Priya Sharma',
        email: 'assignee@example.com',
        password: 'password123'
      });
      await assignee.save();
      console.log('Created assignee user');
    }
    
    // Create a test task
    const task = new Task({
      title: 'Test Real Assignment',
      description: 'This is a test task for real assignment',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      owner: owner._id,
      assignedTo: []
    });
    
    const savedTask = await task.save();
    console.log('Created test task:', savedTask.title);
    
    // Populate the task with owner data
    await savedTask.populate('owner', 'name email');
    
    console.log('Sending task assignment email...');
    const result = await sendTaskAssignmentEmail(
      assignee, // assigned user
      savedTask.owner, // assigning user (task owner)
      savedTask // task details
    );
    
    console.log('Email sending result:', result);
    
    if (result) {
      console.log('Task assignment email sent successfully!');
    } else {
      console.log('Failed to send task assignment email');
    }
    
  } catch (error) {
    console.error('Error in real assignment test:', error);
  } finally {
    // Clean up test data
    try {
      await Task.deleteMany({ title: 'Test Real Assignment' });
      await userModel.deleteMany({ email: { $in: ['owner@example.com', 'assignee@example.com'] } });
      console.log('Cleaned up test data');
    } catch (cleanupError) {
      console.error('Error cleaning up test data:', cleanupError);
    }
    
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

testRealAssignment();