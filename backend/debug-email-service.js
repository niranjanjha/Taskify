import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

// Test the email configuration directly
async function testEmailConfig() {
  console.log('Testing email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS: [HIDDEN]');
  
  // Check if environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('EMAIL_USER or EMAIL_PASS not set in environment variables');
    return;
  }
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  try {
    // Verify transporter connection
    await transporter.verify();
    console.log('Email transporter verified successfully');
    
    // Try to send a test email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: 'Taskify Email Service Test',
      text: 'This is a test email from Taskify task assignment service.'
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Email service error:', error.message);
    console.error('Error code:', error.code);
    if (error.response) {
      console.error('Error response:', error.response);
    }
  }
}

testEmailConfig();