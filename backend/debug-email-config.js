import dotenv from 'dotenv';
dotenv.config();

console.log('=== Email Configuration Debug ===\n');

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

// Test actual email connection
import nodemailer from 'nodemailer';

console.log('Testing email transporter configuration...');

try {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  console.log('✅ Transporter created successfully');
  console.log('Testing connection to Gmail servers...');

  transporter.verify()
    .then(() => {
      console.log('✅ SUCCESS: Connected to Gmail servers!');
      console.log('Email configuration is working correctly.');
      
      // Test sending a simple email
      console.log('\nTesting email sending...');
      
      const mailOptions = {
        from: emailUser,
        to: emailUser, // Send to yourself for testing
        subject: 'Taskify Email Test',
        text: 'This is a test email from Taskify. If you received this, your email configuration is working!'
      };

      transporter.sendMail(mailOptions)
        .then(() => {
          console.log('✅ SUCCESS: Test email sent successfully!');
          console.log('Your welcome email functionality should now work.');
        })
        .catch((sendError) => {
          console.log('❌ ERROR: Failed to send test email');
          console.log('Error:', sendError.message);
        });
    })
    .catch((verifyError) => {
      console.log('❌ ERROR: Failed to connect to Gmail servers');
      console.log('Error:', verifyError.message);
      
      // Provide specific troubleshooting
      if (verifyError.message.includes('Invalid login') || verifyError.message.includes('BadCredentials')) {
        console.log('\n🔧 TROUBLESHOOTING TIPS:');
        console.log('1. Double-check your EMAIL_USER and EMAIL_PASS');
        console.log('2. Ensure EMAIL_PASS is a Gmail App Password, not your regular password');
        console.log('3. Make sure 2-factor authentication is enabled on your Google account');
        console.log('4. Try generating a new App Password at: https://myaccount.google.com/apppasswords');
      }
    });
} catch (error) {
  console.log('❌ ERROR: Failed to create transporter');
  console.log('Error:', error.message);
}