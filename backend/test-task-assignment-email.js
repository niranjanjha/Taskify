import dotenv from 'dotenv';
dotenv.config();

import { sendTaskAssignmentEmail } from './services/taskAssignmentEmailService.js';

// Test data
const assignedUser = {
  name: 'Rajesh Kumar',
  email: 'rajesh.kumar@example.com'
};

const assigningUser = {
  name: 'Priya Sharma',
  email: 'priya.sharma@example.com'
};

const task = {
  title: 'Complete project proposal',
  description: 'Finish the project proposal document and submit it for review',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
};

// Test the email service
async function testEmail() {
  console.log('Testing task assignment email service...');
  
  try {
    const result = await sendTaskAssignmentEmail(assignedUser, assigningUser, task);
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmail();