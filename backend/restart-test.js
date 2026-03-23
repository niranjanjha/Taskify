// Force clean environment
delete process.env.EMAIL_USER;
delete process.env.EMAIL_PASS;

import dotenv from 'dotenv';
dotenv.config({ override: true });

console.log('=== Restart Test with Clean Environment ===\n');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log('Environment variables after clean load:');
console.log('EMAIL_USER:', emailUser);
console.log('EMAIL_PASS:', emailPass ? 'SET (hidden for security)' : 'NOT SET');

if (!emailUser || emailUser === 'your_actual_gmail_address@gmail.com') {
  console.log('\n❌ ERROR: EMAIL_USER not loaded correctly from .env');
  console.log('Current value:', emailUser);
} else {
  console.log('\n✅ EMAIL_USER loaded correctly');
}

if (!emailPass || emailPass === 'your_gmail_app_password') {
  console.log('❌ ERROR: EMAIL_PASS not loaded correctly from .env');
  console.log('Current value:', emailPass ? 'PLACEHOLDER VALUE' : 'UNDEFINED');
} else {
  console.log('✅ EMAIL_PASS loaded correctly');
}

if (emailUser && emailUser !== 'your_actual_gmail_address@gmail.com' && 
    emailPass && emailPass !== 'your_gmail_app_password') {
  console.log('\n✅ Both credentials loaded correctly. Testing welcome email...');
  
  // Test welcome email function
  import('./services/welcomeEmailService.js')
    .then(module => {
      const { sendWelcomeEmail } = module;
      
      // Test user data (using Indian name as per preference)
      const testUser = {
        name: 'Amit Patel',
        email: 'shubhamjha4830@gmail.com'
      };

      return sendWelcomeEmail(testUser);
    })
    .then((result) => {
      if (result) {
        console.log('✅ SUCCESS: Welcome email sent successfully with loaded credentials!');
      } else {
        console.log('❌ FAILED: Welcome email function returned false');
      }
    })
    .catch((error) => {
      console.log('❌ ERROR: Exception occurred while sending welcome email');
      console.log('Error:', error.message);
    });
} else {
  console.log('\n❌ Credentials not loaded properly. Cannot test welcome email.');
  console.log('Please check your .env file and restart the server.');
}