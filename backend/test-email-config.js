import dotenv from 'dotenv';
dotenv.config();

import { initializeTransporter } from './services/welcomeEmailService.js';

console.log('Testing email configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');

if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_actual_gmail_address@gmail.com' &&
    process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'your_gmail_app_password') {
    console.log('Email credentials appear to be configured.');
    
    try {
        initializeTransporter();
        console.log('Transporter initialized successfully.');
        console.log('Configuration seems correct. You can now test sending emails.');
    } catch (error) {
        console.error('Error initializing transporter:', error.message);
    }
} else {
    console.log('Email credentials are not properly configured.');
    console.log('Please update your .env file with actual Gmail credentials.');
    console.log('For Gmail, you need to use an App Password, not your regular password.');
    console.log('Visit: https://myaccount.google.com/apppasswords to generate an App Password');
}