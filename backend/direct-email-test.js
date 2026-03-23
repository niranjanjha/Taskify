// Direct test without dotenv
console.log('=== Direct Email Test ===\n');

// Set credentials directly
const emailUser = '1contacttaskify@gmail.com';
const emailPass = 'egmo wwwa cpdj xspz';

console.log('Using direct credentials:');
console.log('EMAIL_USER:', emailUser);
console.log('EMAIL_PASS:', emailPass ? 'SET (hidden for security)' : 'NOT SET');

if (!emailUser || !emailPass) {
  console.log('\n❌ ERROR: Missing email credentials');
  process.exit(1);
}

// Test actual email functionality
import nodemailer from 'nodemailer';

console.log('\nTesting email transporter...');

try {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  console.log('✅ Transporter created successfully');
  
  transporter.verify()
    .then(() => {
      console.log('✅ SUCCESS: Connected to Gmail servers!');
      
      // Test sending a simple email
      console.log('\nTesting email sending...');
      
      const mailOptions = {
        from: emailUser,
        to: 'shubhamjha4830@gmail.com', // Send to your personal email for testing
        subject: 'Taskify Direct Email Test',
        text: 'This is a direct test email from Taskify. If you received this, your email configuration is working!'
      };

      transporter.sendMail(mailOptions)
        .then(() => {
          console.log('✅ SUCCESS: Direct test email sent successfully!');
          console.log('Your welcome email functionality should now work.');
        })
        .catch((sendError) => {
          console.log('❌ ERROR: Failed to send direct test email');
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
        console.log('5. Check if your App Password has spaces in the correct places');
      }
    });
} catch (error) {
  console.log('❌ ERROR: Failed to create transporter');
  console.log('Error:', error.message);
}