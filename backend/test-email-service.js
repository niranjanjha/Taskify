// Test script for email services
import dotenv from 'dotenv';
dotenv.config();

import { initializeTransporter, sendWelcomeEmail } from './services/welcomeEmailService.js';

console.log('Testing email services...');

// Initialize transporter
initializeTransporter();

// Test sending welcome email
const testUser = {
  name: 'Shubham Jha',
  email: 'shubhamjha4830@gamil.com'
};

console.log('Sending welcome email to:', testUser.email);

sendWelcomeEmail(testUser)
  .then(result => {
    if (result) {
      console.log('✅ Welcome email sent successfully!');
    } else {
      console.log('❌ Failed to send welcome email.');
    }
  })
  .catch(error => {
    console.error('Error sending welcome email:', error);
  });