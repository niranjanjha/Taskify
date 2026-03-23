import dotenv from 'dotenv';
dotenv.config();

console.log('=== Quick Email Configuration Check ===\n');

// Check if required environment variables are set
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log('Current Configuration:');
console.log('EMAIL_USER:', emailUser);
console.log('EMAIL_PASS:', emailPass ? 'SET (hidden)' : 'NOT SET');

// Check if using placeholder values
if (!emailUser || !emailPass) {
  console.log('\n❌ CONFIGURATION INCOMPLETE');
  console.log('Both EMAIL_USER and EMAIL_PASS must be set in .env file');
} else if (emailUser === 'your_actual_gmail_address@gmail.com' || emailPass === 'your_gmail_app_password') {
  console.log('\n❌ PLACEHOLDER VALUES DETECTED');
  console.log('You are still using placeholder values. Please update with actual credentials:');
  console.log('1. Open .env file in backend directory');
  console.log('2. Replace EMAIL_USER with your actual Gmail address');
  console.log('3. Replace EMAIL_PASS with your Gmail App Password');
  console.log('4. Save the file and run this test again');
  console.log('\n📝 DETAILED SETUP INSTRUCTIONS:');
  console.log('- Follow the instructions in EMAIL_SETUP.md');
  console.log('- Generate a Gmail App Password at: https://myaccount.google.com/apppasswords');
} else {
  console.log('\n✅ CONFIGURATION APPEARS CORRECT');
  console.log('You can now test the email functionality with the comprehensive test script');
  console.log('Run: node comprehensive-email-test.js');
}

console.log('\n=== End Check ===');