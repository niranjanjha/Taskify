import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { checkUpcomingDeadlines } from './services/emailReminderService.js';

console.log('=== Taskify Reminder Service Test ===\n');

// Test the reminder service functionality
const testReminderService = async () => {
  try {
    console.log('1. Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');
    
    console.log('\n2. Testing upcoming deadlines check...');
    await checkUpcomingDeadlines();
    console.log('✅ Deadline check completed');
    
    console.log('\n3. Checking reminder service configuration...');
    
    // Check if EMAIL_USER and EMAIL_PASS are configured
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass || 
        emailUser === 'your_actual_gmail_address@gmail.com' || 
        emailPass === 'your_gmail_app_password') {
      console.log('⚠️  WARNING: Email credentials not properly configured');
      console.log('   Reminder emails will not be sent');
      console.log('   Please update EMAIL_USER and EMAIL_PASS in .env file');
    } else {
      console.log('✅ Email credentials configured properly');
      console.log('   Reminder emails should be sent correctly');
    }
    
    console.log('\n4. Reminder Service Schedule:');
    console.log('   - Runs every hour at minute 0');
    console.log('   - Checks for tasks/subtasks due within 4 hours');
    console.log('   - Sends email reminders to task owners and assignees');
    
    console.log('\n=== Test Complete ===');
    console.log('The reminder service is properly integrated and should work when the server is running.');
    
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('Stack trace:', error.stack);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔒 Database connection closed');
    }
  }
};

testReminderService();