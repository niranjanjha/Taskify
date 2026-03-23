import dotenv from 'dotenv';
dotenv.config();

import { sendWelcomeEmail } from './services/welcomeEmailService.js';

// Test user data
const testUser = {
  name: 'Shubham Jha',
  email: 'shubhamjha4830@gmail.com' // Replace with your actual email for testing
};

console.log('Testing welcome email function...');

// Test welcome email
const testWelcomeEmail = async () => {
  try {
    console.log('Sending welcome email to:', testUser.email);
    console.log('Using EMAIL_USER:', process.env.EMAIL_USER);
    
    // Check if email credentials are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
        process.env.EMAIL_USER === 'your_actual_gmail_address@gmail.com' ||
        process.env.EMAIL_PASS === 'your_gmail_app_password') {
      console.log('❌ ERROR: Email credentials not properly configured in .env file');
      console.log('Please update EMAIL_USER and EMAIL_PASS with actual Gmail credentials');
      return;
    }
    
    const result = await sendWelcomeEmail(testUser);
    
    if (result) {
      console.log('✅ SUCCESS: Welcome email sent successfully!');
    } else {
      console.log('❌ FAILED: Welcome email was not sent (check error logs above)');
    }
  } catch (error) {
    console.error('❌ ERROR: Exception occurred while sending welcome email:', error.message);
    console.log('Stack trace:', error.stack);
  }
};

testWelcomeEmail();