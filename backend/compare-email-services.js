import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';
import { initializeTransporter as initWelcomeTransporter } from './services/welcomeEmailService.js';
import { initializeTransporter as initTaskTransporter } from './services/taskAssignmentEmailService.js';

// Test both transporters
async function compareTransporters() {
  console.log('Comparing email transporters...');
  
  // Test welcome email transporter
  console.log('\n--- Testing Welcome Email Transporter ---');
  try {
    initWelcomeTransporter();
    console.log('Welcome transporter initialized');
  } catch (error) {
    console.error('Error initializing welcome transporter:', error);
  }
  
  // Test task assignment email transporter
  console.log('\n--- Testing Task Assignment Transporter ---');
  try {
    initTaskTransporter();
    console.log('Task assignment transporter initialized');
  } catch (error) {
    console.error('Error initializing task assignment transporter:', error);
  }
  
  // Test direct nodemailer transporter
  console.log('\n--- Testing Direct Nodemailer Transporter ---');
  try {
    const directTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    await directTransporter.verify();
    console.log('Direct transporter verified successfully');
  } catch (error) {
    console.error('Error with direct transporter:', error.message);
  }
}

compareTransporters();