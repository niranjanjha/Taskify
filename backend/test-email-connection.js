import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

console.log('Testing email configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET (hidden for security)' : 'NOT SET');

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('Attempting to configure transporter...');
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    console.log('Transporter configured. Testing connection...');
    
    transporter.verify()
        .then(() => {
            console.log('✅ SUCCESS: Email transporter is ready to send emails!');
            console.log('Your email configuration is working correctly.');
        })
        .catch((error) => {
            console.log('❌ ERROR: Failed to verify email transporter');
            console.log('Error details:', error.message);
            console.log('\nTroubleshooting tips:');
            console.log('1. Check that your EMAIL_USER is a valid Gmail address');
            console.log('2. Check that your EMAIL_PASS is a Gmail App Password, not your regular password');
            console.log('3. Make sure 2-factor authentication is enabled on your Google account');
            console.log('4. Generate an App Password at: https://myaccount.google.com/apppasswords');
        });
} else {
    console.log('Email credentials are not properly configured in .env file.');
    console.log('Please make sure both EMAIL_USER and EMAIL_PASS are set.');
}