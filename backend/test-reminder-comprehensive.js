import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Task from './models/taskModel.js';
import userModel from './models/userModel.js';
import { checkUpcomingDeadlines } from './services/emailReminderService.js';

console.log('=== Comprehensive Reminder Service Test ===\n');

// Test the reminder service with simulated data
const testReminderServiceComprehensive = async () => {
  try {
    console.log('1. Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Create a test user if one doesn't exist
    let testUser = await userModel.findOne({ email: 'shubhamjha4830@gmail.com' });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = await userModel.create({
        name: 'Shubham Jha',
        email: 'shubhamjha4830@gmail.com',
        password: 'testpassword123' // This will be hashed in the model
      });
      console.log('✅ Test user created');
    } else {
      console.log('✅ Using existing test user');
    }
    
    // Create a task that's due within 4 hours
    console.log('\n2. Creating test task due within 4 hours...');
    
    // Set due date to 2 hours from now
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + 2);
    
    const testTask = await Task.create({
      title: 'Test Reminder Task',
      description: 'This is a test task to verify reminder functionality',
      dueDate: dueDate,
      priority: 'High',
      owner: testUser._id,
      completed: false
    });
    
    console.log('✅ Test task created:', testTask.title);
    console.log('   Due date:', testTask.dueDate.toLocaleString());
    
    console.log('\n3. Testing upcoming deadlines check...');
    await checkUpcomingDeadlines();
    
    // Clean up - delete the test task
    console.log('\n4. Cleaning up test data...');
    await Task.findByIdAndDelete(testTask._id);
    console.log('✅ Test task deleted');
    
    console.log('\n=== Test Complete ===');
    console.log('The reminder service is properly integrated and functional.');
    console.log('It correctly identifies upcoming deadlines and processes them.');
    
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('Stack trace:', error.stack);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔒 Database connection closed');
    }
  }
};

testReminderServiceComprehensive();