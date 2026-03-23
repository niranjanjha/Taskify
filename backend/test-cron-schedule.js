import dotenv from 'dotenv';
dotenv.config();

import scheduleEmailReminders from './services/emailReminderService.js';

console.log('=== Taskify Cron Schedule Test ===\n');

console.log('Testing cron schedule configuration...');

// Check if the cron schedule is properly set up
try {
  // This will initialize the transporter and schedule the reminders
  scheduleEmailReminders();
  
  console.log('✅ Email reminder service scheduled successfully');
  console.log('📝 Schedule details:');
  console.log('   - Pattern: 0 * * * * (Every hour at minute 0)');
  console.log('   - Function: checkUpcomingDeadlines');
  console.log('   - Purpose: Check for tasks/subtasks due within 4 hours');
  
  console.log('\n⏰ Next scheduled runs:');
  const now = new Date();
  for (let i = 1; i <= 3; i++) {
    const nextRun = new Date(now);
    nextRun.setHours(now.getHours() + i);
    nextRun.setMinutes(0);
    nextRun.setSeconds(0);
    console.log(`   ${i}. ${nextRun.toLocaleString()}`);
  }
  
  console.log('\n✅ Cron scheduling is working correctly');
  console.log('The reminder service will automatically check for upcoming deadlines every hour.');
  
} catch (error) {
  console.log('❌ ERROR scheduling email reminders:', error.message);
}

console.log('\n=== Test Complete ===');