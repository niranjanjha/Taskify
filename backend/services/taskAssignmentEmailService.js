import { getTransporter } from './emailService.js';

// Function to send task assignment email
export const sendTaskAssignmentEmail = async (assignedUser, assigningUser, task) => {
  try {
    const transporter = getTransporter();

    // Verify transporter connection
    await transporter.verify();
    console.log('Email transporter is ready to send emails');

    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: assignedUser.email,
      subject: `You've been assigned a task: ${task.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Task Assignment Notification</title>
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
                        <img src="https://cdn-icons-png.flaticon.com/512/3652/3652827.png" width="36" height="36" alt="Taskify Zap Icon" style="display: block;">
                      </div>
                      <h1 style="color: white; font-size: 36px; margin: 0 0 8px; font-weight: 800; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Taskify</h1>
                      <p style="color: rgba(255,255,255,0.92); font-size: 19px; margin: 0; font-weight: 500;">
                        Task Assignment Notification
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Assignment message -->
                  <tr>
                    <td style="padding: 50px 40px 40px;">
                      <h2 style="color: #1e293b; font-size: 28px; margin: 0 0 25px; font-weight: 800; text-align: center; letter-spacing: -0.3px;">
                        📋 New Task Assigned to You
                      </h2>
                      
                      <p style="color: #64748b; font-size: 18px; line-height: 1.7; margin: 0 0 30px; text-align: center; font-weight: 400;">
                        Hi ${assignedUser.name},<br>
                        ${assigningUser.name} has assigned you a new task in Taskify:
                      </p>
                      
                      <!-- Task details card -->
                      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; padding: 30px; margin: 35px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid rgba(139, 92, 246, 0.08);">
                        <h3 style="color: #8b5cf6; font-size: 24px; margin: 0 0 20px; font-weight: 700; text-align: center; letter-spacing: -0.2px;">
                          ${task.title}
                        </h3>
                        
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                              <strong style="color: #334155; font-size: 16px;">Assigned by:</strong>
                            </td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                              <span style="color: #8b5cf6; font-size: 16px; font-weight: 600;">
                                ${assigningUser.name}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                              <strong style="color: #334155; font-size: 16px;">Due Date:</strong>
                            </td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                              <span style="color: #8b5cf6; font-size: 16px; font-weight: 600;">
                                ${task.dueDate ? new Date(task.dueDate).toLocaleString('en-US', { 
                                  weekday: 'short', 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                }) : 'No due date set'}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0;">
                              <strong style="color: #334155; font-size: 16px;">Description:</strong>
                            </td>
                            <td style="padding: 12px 0; text-align: right;">
                              <span style="color: #64748b; font-size: 16px;">
                                ${task.description || 'No description provided'}
                              </span>
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      <p style="color: #64748b; font-size: 18px; line-height: 1.7; margin: 35px 0; text-align: center; font-weight: 400;">
                        Please check your Taskify dashboard to view and manage this task.
                      </p>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 40px 0 45px;">
                        <a href="http://localhost:5173" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 14px; color: white; text-decoration: none; font-weight: 600; font-size: 17px; box-shadow: 0 6px 16px rgba(139, 92, 246, 0.35); letter-spacing: -0.2px; transition: all 0.2s ease;">
                          View Task in Taskify
                        </a>
                      </div>
                      
                      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 16px; padding: 25px; margin: 35px 0; border: 1px solid rgba(14, 165, 233, 0.15);">
                        <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0; text-align: center; font-weight: 500;">
                          <span style="color: #0ea5e9; font-weight: 700;">💡 Pro Tip:</span> Set reminders for your tasks to stay on track with deadlines!
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
                        <img src="https://cdn-icons-png.flaticon.com/512/3652/3652827.png" width="20" height="20" alt="Taskify Zap Icon" style="display: block;">
                      </div>
                      <p style="color: #94a3b8; font-size: 15px; margin: 0 0 10px; font-weight: 500;">
                        &copy; ${new Date().getFullYear()} Taskify. All rights reserved.
                      </p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                        This email was sent to ${assignedUser.email}
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
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Task assignment email sent to ${assignedUser.email} for task: ${task.title}`);
    console.log('Email sent successfully with messageId:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending task assignment email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    
    // Don't fail the assignment if email sending fails
    return false;
  }
};