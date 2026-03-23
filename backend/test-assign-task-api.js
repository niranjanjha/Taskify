import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Task from './models/taskModel.js';
import userModel from './models/userModel.js';
import { assignUserToTask } from './controllers/taskController.js';

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

// Mock request and response objects
const createMockReqRes = (owner, assignee, task) => {
  const req = {
    user: { id: owner._id },
    body: {
      taskId: task._id,
      userId: assignee._id,
      role: 'Member'
    }
  };
  
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.data = data;
      console.log(`Response Status: ${this.statusCode}`);
      console.log('Response Data:', JSON.stringify(data, null, 2));
    }
  };
  
  return { req, res };
};

// Test the assign user to task API
async function testAssignTaskAPI() {
  await connectDB();
  
  try {
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
    let task = await Task.findOne({ title: 'Test Assigned Task API' });
    if (!task) {
      task = new Task({
        title: 'Test Assigned Task API',
        description: 'This is a test task for API assignment',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        owner: owner._id,
        assignedTo: []
      });
      await task.save();
      console.log('Created test task:', task.title);
    }
    
    // Simulate the API call
    console.log('Simulating task assignment API call...');
    
    const { req, res } = createMockReqRes(owner, assignee, task);
    
    await assignUserToTask(req, res);
    
    console.log('Task assignment API call completed');
    
  } catch (error) {
    console.error('Error in task assignment API test:', error);
  } finally {
    // Clean up test data
    try {
      await Task.deleteMany({ title: 'Test Assigned Task API' });
      await userModel.deleteMany({ email: { $in: ['owner@example.com', 'assignee@example.com'] } });
      console.log('Cleaned up test data');
    } catch (cleanupError) {
      console.error('Error cleaning up test data:', cleanupError);
    }
    
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

testAssignTaskAPI();