// Force reload environment variables
process.env.EMAIL_USER = undefined;
process.env.EMAIL_PASS = undefined;

import dotenv from 'dotenv';
const result = dotenv.config();

if (result.error) {
  console.log('Error loading .env file:', result.error);
}

console.log('=== Fresh Email Configuration Test ===\n');

// Check environment variables
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log('Current Configuration:');
console.log('EMAIL_USER:', emailUser);
console.log('EMAIL_PASS:', emailPass ? 'SET (hidden for security)' : 'NOT SET');

// Validate configuration
if (!emailUser || !emailPass) {
  console.log('\n❌ ERROR: Missing email configuration');
  console.log('Both EMAIL_USER and EMAIL_PASS must be set in .env file');
  process.exit(1);
}

if (emailUser === 'your_actual_gmail_address@gmail.com') {
  console.log('\n❌ ERROR: EMAIL_USER still contains placeholder value');
  console.log('Please update EMAIL_USER with your actual Gmail address');
  process.exit(1);
}

if (emailPass === 'your_gmail_app_password') {
  console.log('\n❌ ERROR: EMAIL_PASS still contains placeholder value');
  console.log('Please update EMAIL_PASS with your Gmail App Password');
  process.exit(1);
}

console.log('\n✅ Email credentials appear to be properly configured');
console.log('Proceeding with connection test...\n');

// Test actual email functionality
import { sendWelcomeEmail } from './services/welcomeEmailService.js';

// Test user data (using Indian name as per preference)
const testUser = {
  name: 'Shubham Kumar',
  email: emailUser // Send to the same email for testing
};

console.log('Testing welcome email function with user:', testUser.name);

sendWelcomeEmail(testUser)
  .then((result) => {
    if (result) {
      console.log('✅ SUCCESS: Welcome email sent successfully!');
      console.log('Your email configuration is working correctly.');
      console.log('New users should now receive welcome emails.');
    } else {
      console.log('❌ FAILED: Welcome email function returned false');
      console.log('Check server logs for detailed error information.');
    }
  })
  .catch((error) => {
    console.log('❌ ERROR: Exception occurred while sending welcome email');
    console.log('Error:', error.message);
    
    // Provide specific troubleshooting
    if (error.message.includes('Invalid login') || error.message.includes('BadCredentials')) {
      console.log('\n🔧 TROUBLESHOOTING TIPS:');
      console.log('1. Double-check your EMAIL_USER and EMAIL_PASS');
      console.log('2. Ensure EMAIL_PASS is a Gmail App Password, not your regular password');
      console.log('3. Make sure 2-factor authentication is enabled on your Google account');
      console.log('4. Try generating a new App Password at: https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 TROUBLESHOOTING TIPS:');
      console.log('1. Check your internet connection');
      console.log('2. Ensure Gmail services are accessible from your location');
    }
  });