import dotenv from 'dotenv';
dotenv.config();

import { initializeTransporter, sendWelcomeEmail } from './services/welcomeEmailService.js';

// Initialize transporter
initializeTransporter();

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com' // Replace with your actual email for testing
};

// Test welcome email
const testWelcomeEmail = async () => {
  try {
    console.log('Testing welcome email...');
    console.log('Make sure to update the email address in the testUser object to your actual email for testing');
    
    const result = await sendWelcomeEmail(testUser);
    
    if (result) {
      console.log('Welcome email sent successfully!');
    } else {
      console.log('Failed to send welcome email.');
    }
  } catch (error) {
    console.error('Error testing welcome email:', error);
  }
};

testWelcomeEmail();