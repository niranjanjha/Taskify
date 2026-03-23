import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

// Exact implementation from the services
let transporter;

const initializeTransporter = () => {
  transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service provider
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Initialize transporter
initializeTransporter();

// Test the transporter
async function testTransporter() {
  console.log('Testing service implementation transporter...');
  
  try {
    // Verify transporter connection
    await transporter.verify();
    console.log('Transporter verified successfully');
    
    // Try to send a test email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: 'Taskify Service Implementation Test',
      text: 'This is a test email using the exact service implementation.'
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Service implementation error:', error.message);
    console.error('Error code:', error.code);
    if (error.response) {
      console.error('Error response:', error.response);
    }
  }
}

testTransporter();