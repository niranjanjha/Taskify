import { getTransporter } from './services/emailService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmail() {
  try {
    console.log('Testing email service...');
    
    const transporter = getTransporter();
    
    // Verify transporter connection
    await transporter.verify();
    console.log('Email transporter is ready to send emails');
    
    // Send a test email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: 'shubhamjha4830@gmail.com', // Replace with your email for testing
      subject: 'Taskify Email Service Test',
      text: 'This is a test email from Taskify to verify the email service is working properly.'
    };

    await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Error testing email service:', error);
  }
}

// Run the test
testEmail();