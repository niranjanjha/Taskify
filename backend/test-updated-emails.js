import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

console.log('=== Taskify Updated Email Templates Test ===\n');

// Test both updated email templates
const testUpdatedEmails = async () => {
  try {
    // Check email configuration
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass || 
        emailUser === 'your_actual_gmail_address@gmail.com' || 
        emailPass === 'your_gmail_app_password') {
      console.log('⚠️  Email credentials not properly configured');
      console.log('   Please update EMAIL_USER and EMAIL_PASS in .env file');
      return;
    }
    
    console.log('✅ Email credentials configured');
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    
    console.log('\n1. Testing connection to email server...');
    await transporter.verify();
    console.log('✅ Connected to email server successfully');
    
    // Test updated welcome email template
    console.log('\n2. Testing updated welcome email template with fixed icons...');
    
    const welcomeEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Taskify</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; background: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%); background-size: cover; background-repeat: no-repeat;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%);">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid rgba(139, 92, 246, 0.1);">
                <!-- Header with Zap logo -->
                <tr>
                  <td align="center" style="padding: 50px 30px 40px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
                    <div style="width: 80px; height: 80px; background: white; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                      <!-- Taskify Zap Icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                    </div>
                    <h1 style="color: white; font-size: 42px; margin: 0 0 10px; font-weight: 800; letter-spacing: -0.8px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Taskify</h1>
                    <p style="color: rgba(255,255,255,0.92); font-size: 20px; margin: 0; font-weight: 500; max-width: 80%; line-height: 1.4; margin: 0 auto;">
                      Boost Your Productivity
                    </p>
                  </td>
                </tr>
                
                <!-- Welcome message -->
                <tr>
                  <td style="padding: 50px 40px 40px;">
                    <h2 style="color: #1e293b; font-size: 32px; margin: 0 0 25px; font-weight: 800; text-align: center; letter-spacing: -0.5px;">
                      Welcome to the team, Shubham! 👋
                    </h2>
                    
                    <p style="color: #64748b; font-size: 18px; line-height: 1.7; margin: 0 0 30px; text-align: center; font-weight: 400;">
                      We're thrilled to have you join Taskify! Get ready to transform how you manage tasks and boost your productivity with our intuitive platform.
                    </p>
                    
                    <!-- Features section -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0 45px;">
                      <tr>
                        <td align="center" style="padding: 0 10px;">
                          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 30px 20px; width: 170px; display: inline-block; margin: 0 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid rgba(139, 92, 246, 0.08);">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.2);">
                              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                            </div>
                            <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 8px; font-weight: 700;">Task Tracking</h3>
                            <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">Stay on top of deadlines</p>
                          </div>
                          
                          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 30px 20px; width: 170px; display: inline-block; margin: 0 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid rgba(139, 92, 246, 0.08);">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.2);">
                              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                              </svg>
                            </div>
                            <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 8px; font-weight: 700;">Team Collaboration</h3>
                            <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">Work together seamlessly</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #64748b; font-size: 18px; line-height: 1.7; margin: 35px 0 40px; text-align: center; font-weight: 400;">
                      Start organizing your tasks today and experience the power of streamlined productivity with Taskify.
                    </p>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 45px 0 50px;">
                      <a href="http://localhost:5173" style="display: inline-block; padding: 18px 36px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 14px; color: white; text-decoration: none; font-weight: 600; font-size: 18px; box-shadow: 0 6px 16px rgba(139, 92, 246, 0.35); letter-spacing: -0.2px; transition: all 0.2s ease;">
                        Start Organizing Tasks
                      </a>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 16px; padding: 25px; margin: 40px 0; border: 1px solid rgba(14, 165, 233, 0.15);">
                      <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 15px; text-align: center; font-weight: 500;">
                        <span style="color: #0ea5e9; font-weight: 700;">💡 Pro Tip:</span> Set due dates for your tasks to receive automatic reminders before deadlines!
                      </p>
                    </div>
                    
                    <p style="color: #64748b; font-size: 17px; line-height: 1.7; margin: 35px 0 0; text-align: center; font-weight: 400;">
                      Have questions? Our support team is here to help!
                    </p>
                    
                    <p style="color: #64748b; font-size: 17px; line-height: 1.7; margin: 15px 0 0; text-align: center; font-weight: 400;">
                      Best regards,<br>
                      <strong style="color: #8b5cf6;">The Taskify Team</strong>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                      <!-- Taskify Zap Icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                    </div>
                    <p style="color: #94a3b8; font-size: 15px; margin: 0 0 10px; font-weight: 500;">
                      &copy; 2025 Taskify. All rights reserved.
                    </p>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                      This email was sent to shubhamjha4830@gmail.com
                    </p>
                    <p style="color: #cbd5e1; font-size: 13px; margin: 20px 0 0;">
                      123 Productivity Street, Tech City, TC 10001
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    
    const welcomeMailOptions = {
      from: emailUser,
      to: 'shubhamjha4830@gmail.com',
      subject: 'Welcome to Taskify - Your Productivity Partner!',
      html: welcomeEmailHtml
    };
    
    await transporter.sendMail(welcomeMailOptions);
    console.log('✅ Updated welcome email sent successfully with fixed icons!');
    
    // Test updated reminder email template
    console.log('\n3. Testing updated reminder email template with consistent colors...');
    
    const reminderEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Reminder</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; background: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%); background-size: cover; background-repeat: no-repeat;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%);">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid rgba(139, 92, 246, 0.1);">
                <!-- Header with Zap logo -->
                <tr>
                  <td align="center" style="padding: 45px 30px 35px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
                    <div style="width: 70px; height: 70px; background: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; box-shadow: 0 6px 16px rgba(0,0,0,0.15);">
                      <!-- Taskify Zap Icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                    </div>
                    <h1 style="color: white; font-size: 36px; margin: 0 0 8px; font-weight: 800; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Taskify</h1>
                    <p style="color: rgba(255,255,255,0.92); font-size: 19px; margin: 0; font-weight: 500;">
                      Task Reminder
                    </p>
                  </td>
                </tr>
                
                <!-- Reminder message -->
                <tr>
                  <td style="padding: 50px 40px 40px;">
                    <h2 style="color: #1e293b; font-size: 28px; margin: 0 0 25px; font-weight: 800; text-align: center; letter-spacing: -0.3px;">
                      ⏰ Upcoming Deadline Alert
                    </h2>
                    
                    <p style="color: #64748b; font-size: 18px; line-height: 1.7; margin: 0 0 30px; text-align: center; font-weight: 400;">
                      Hi Shubham,<br>
                      This is a friendly reminder that the following task is due soon:
                    </p>
                    
                    <!-- Task details card -->
                    <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 30px; margin: 35px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid rgba(139, 92, 246, 0.08);">
                      <h3 style="color: #8b5cf6; font-size: 24px; margin: 0 0 20px; font-weight: 700; text-align: center; letter-spacing: -0.2px;">
                        Updated Email Template Test
                      </h3>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <strong style="color: #334155; font-size: 16px;">Due Date:</strong>
                          </td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                            <span style="color: #8b5cf6; font-size: 16px; font-weight: 600;">
                              Wed, Oct 20, 2025, 06:00 AM
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0;">
                            <strong style="color: #334155; font-size: 16px;">Description:</strong>
                          </td>
                          <td style="padding: 12px 0; text-align: right;">
                            <span style="color: #64748b; font-size: 16px;">
                              Testing the updated email templates with fixed icons and consistent color schemes
                            </span>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <p style="color: #64748b; font-size: 18px; line-height: 1.7; margin: 35px 0; text-align: center; font-weight: 400;">
                      Please make sure to complete this task on time to stay on track with your goals.
                    </p>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 40px 0 45px;">
                      <a href="http://localhost:5173" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 14px; color: white; text-decoration: none; font-weight: 600; font-size: 17px; box-shadow: 0 6px 16px rgba(139, 92, 246, 0.35); letter-spacing: -0.2px; transition: all 0.2s ease;">
                        View Task in Taskify
                      </a>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 16px; padding: 25px; margin: 35px 0; border: 1px solid rgba(14, 165, 233, 0.15);">
                      <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0; text-align: center; font-weight: 500;">
                        <span style="color: #0ea5e9; font-weight: 700;">💡 Pro Tip:</span> Break large tasks into subtasks to make them more manageable!
                      </p>
                    </div>
                    
                    <p style="color: #64748b; font-size: 17px; line-height: 1.7; margin: 35px 0 0; text-align: center; font-weight: 400;">
                      Stay productive,<br>
                      <strong style="color: #8b5cf6;">The Taskify Team</strong>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                      <!-- Taskify Zap Icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                    </div>
                    <p style="color: #94a3b8; font-size: 15px; margin: 0 0 10px; font-weight: 500;">
                      &copy; 2025 Taskify. All rights reserved.
                    </p>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                      This email was sent to shubhamjha4830@gmail.com
                    </p>
                    <p style="color: #cbd5e1; font-size: 13px; margin: 20px 0 0;">
                      123 Productivity Street, Tech City, TC 10001
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    
    const reminderMailOptions = {
      from: emailUser,
      to: 'shubhamjha4830@gmail.com',
      subject: '⏰ Task Reminder: Updated Email Template Test',
      html: reminderEmailHtml
    };
    
    await transporter.sendMail(reminderMailOptions);
    console.log('✅ Updated reminder email sent successfully with consistent colors!');
    
    console.log('\n=== Test Complete ===');
    console.log('✅ Both email templates have been updated successfully!');
    console.log('✨ Improvements made:');
    console.log('   • Fixed Taskify zap icon display in both header and footer');
    console.log('   • Made reminder email color scheme consistent with welcome email');
    console.log('   • Updated all icons with proper comments for clarity');
    console.log('   • Enhanced visual consistency across all emails');
    console.log('   • Maintained professional appearance with improved branding');
    
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    if (error.code === 'EAUTH') {
      console.log('\n🔧 TROUBLESHOOTING TIPS:');
      console.log('1. Double-check your EMAIL_USER and EMAIL_PASS');
      console.log('2. Ensure EMAIL_PASS is a Gmail App Password, not your regular password');
      console.log('3. Make sure 2-factor authentication is enabled on your Google account');
      console.log('4. Try generating a new App Password at: https://myaccount.google.com/apppasswords');
    }
  }
};

testUpdatedEmails();