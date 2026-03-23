import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Task from './models/taskModel.js';
import userModel from './models/userModel.js';
import { sendTaskAssignmentEmail } from './services/taskAssignmentEmailService.js';

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

// Test the complete task assignment flow
async function testTaskAssignmentFlow() {
  await connectDB();
  
  try {
    // Create test users if they don't exist
    let owner = await userModel.findOne({ email: 'owner@example.com' });
    if (!owner) {
      owner = new userModel({
        name: 'Task Owner',
        email: 'owner@example.com',
        password: 'password123'
      });
      await owner.save();
      console.log('Created owner user');
    }
    
    let assignee = await userModel.findOne({ email: 'assignee@example.com' });
    if (!assignee) {
      assignee = new userModel({
        name: 'Task Assignee',
        email: 'assignee@example.com',
        password: 'password123'
      });
      await assignee.save();
      console.log('Created assignee user');
    }
    
    // Create a test task
    const task = new Task({
      title: 'Test Assigned Task',
      description: 'This is a test task for email notification',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      owner: owner._id,
      assignedTo: []
    });
    
    const savedTask = await task.save();
    console.log('Created test task:', savedTask.title);
    
    // Now simulate the assignment flow
    console.log('Simulating task assignment...');
    
    // Add user to assignedTo array
    savedTask.assignedTo.push({ user: assignee._id, role: 'Member' });
    await savedTask.save();
    
    // Populate the owner and assigned user data
    await savedTask.populate('owner', 'name email');
    await savedTask.populate('assignedTo.user', 'name email');
    
    console.log('Task populated with user data');
    
    // Send email notification (this is where the issue might be)
    console.log('Attempting to send task assignment email...');
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
    console.error('Error in task assignment flow:', error);
  } finally {
    // Clean up test data
    try {
      await Task.deleteMany({ title: 'Test Assigned Task' });
      await userModel.deleteMany({ email: { $in: ['owner@example.com', 'assignee@example.com'] } });
      console.log('Cleaned up test data');
    } catch (cleanupError) {
      console.error('Error cleaning up test data:', cleanupError);
    }
    
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

testTaskAssignmentFlow();