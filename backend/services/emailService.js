import nodemailer from 'nodemailer';

// Configure nodemailer transport
let transporter;

export const initializeTransporter = () => {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

export const getTransporter = () => {
  if (!transporter) {
    initializeTransporter();
  }
  return transporter;
};

export default {
  initializeTransporter,
  getTransporter
};