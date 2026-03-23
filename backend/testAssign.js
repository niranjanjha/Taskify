// We'll test the assign functionality directly by importing the controller function
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { assignUserToTask } from './controllers/taskController.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

async function testAssign() {
  try {
    console.log('Testing assign user to task functionality...');
    
    // Mock request and response objects
    const req = {
      user: {
        id: '6714d0f0f0f0f0f0f0f0f0f0' // Replace with a valid user ID
      },
      body: {
        taskId: '6714d0f0f0f0f0f0f0f0f0f1', // Replace with a valid task ID
        userId: '6714d0f0f0f0f0f0f0f0f0f2',  // Replace with a valid user ID
        role: 'Member'
      }
    };
    
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        console.log('Response status:', this.statusCode);
        console.log('Response data:', data);
      }
    };
    
    await assignUserToTask(req, res);
  } catch (error) {
    console.error('Error testing assign functionality:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAssign();