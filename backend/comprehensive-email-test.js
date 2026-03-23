import dotenv from 'dotenv';
dotenv.config();

import { sendWelcomeEmail } from './services/welcomeEmailService.js';

console.log('=== Taskify Email Configuration Test ===\n');

// Check if required environment variables are set
console.log('1. Checking environment variables...');
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log(`EMAIL_USER: ${emailUser ? 'SET' : 'NOT SET'}`);
console.log(`EMAIL_PASS: ${emailPass ? 'SET' : 'NOT SET'}`);

if (!emailUser || !emailPass) {
  console.log('\n❌ ERROR: EMAIL_USER and/or EMAIL_PASS not set in .env file');
  console.log('Please add the following to your .env file:');
  console.log('EMAIL_USER=your_gmail_address@gmail.com');
  console.log('EMAIL_PASS=your_gmail_app_password');
  process.exit(1);
}

if (emailUser === 'your_actual_gmail_address@gmail.com' || emailPass === 'your_gmail_app_password') {
  console.log('\n❌ ERROR: Placeholder values detected in .env file');
  console.log('Please replace the placeholder values with actual Gmail credentials:');
  console.log('- EMAIL_USER should be your actual Gmail address');
  console.log('- EMAIL_PASS should be a Gmail App Password (not your regular password)');
  process.exit(1);
}

console.log('\n✅ Environment variables are properly configured');

// Test user data
const testUser = {
  name: 'Test User',
  email: 'shubhamjha4830@gmail.com' // This should be your actual email for testing
};

console.log('\n2. Testing welcome email function...');
console.log(`Sending welcome email to: ${testUser.email}`);

// Test welcome email
const testWelcomeEmail = async () => {
  try {
    console.log('\n3. Attempting to send welcome email...');
    const result = await sendWelcomeEmail(testUser);
    
    if (result) {
      console.log('\n✅ SUCCESS: Welcome email sent successfully!');
      console.log('Check your email inbox for the welcome message.');
    } else {
      console.log('\n❌ FAILED: Welcome email was not sent');
      console.log('Check the error logs above for details.');
    }
  } catch (error) {
    console.log('\n❌ ERROR: Exception occurred while sending welcome email');
    console.log('Error message:', error.message);
    
    // Provide specific troubleshooting based on error
    if (error.message.includes('Invalid login') || error.message.includes('BadCredentials')) {
      console.log('\n🔧 TROUBLESHOOTING TIPS:');
      console.log('1. Verify your EMAIL_USER is a valid Gmail address');
      console.log('2. Ensure EMAIL_PASS is a Gmail App Password, not your regular password');
      console.log('3. Make sure 2-factor authentication is enabled on your Google account');
      console.log('4. Generate a new App Password at: https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 TROUBLESHOOTING TIPS:');
      console.log('1. Check your internet connection');
      console.log('2. Ensure Gmail services are accessible from your location');
    }
  }
};

testWelcomeEmail();