import dotenv from 'dotenv';
dotenv.config();

import { sendWelcomeEmail } from './services/welcomeEmailService.js';
import { sendTaskAssignmentEmail } from './services/taskAssignmentEmailService.js';

// Test both email services
async function testServices() {
  console.log('Testing email services...');
  
  // Test welcome email service
  console.log('\n--- Testing Welcome Email Service ---');
  try {
    const welcomeResult = await sendWelcomeEmail({
      name: 'Test User',
      email: process.env.EMAIL_USER
    });
    console.log('Welcome email result:', welcomeResult);
  } catch (error) {
    console.error('Error with welcome email:', error.message);
  }
  
  // Test task assignment email service
  console.log('\n--- Testing Task Assignment Email Service ---');
  try {
    const taskResult = await sendTaskAssignmentEmail(
      {
        name: 'Assignee User',
        email: process.env.EMAIL_USER
      },
      {
        name: 'Assigner User',
        email: process.env.EMAIL_USER
      },
      {
        title: 'Test Task',
        description: 'This is a test task',
        dueDate: new Date()
      }
    );
    console.log('Task assignment email result:', taskResult);
  } catch (error) {
    console.error('Error with task assignment email:', error.message);
  }
}

testServices();