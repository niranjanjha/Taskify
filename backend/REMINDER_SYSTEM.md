# Taskify Reminder Notification System

This document explains how the reminder notification system works in Taskify.

## System Overview

The reminder notification system automatically sends email reminders to users for tasks and subtasks that are due within 4 hours. The system is designed to be:

- **Non-intrusive**: Runs in the background without affecting user experience
- **Reliable**: Uses cron scheduling to ensure consistent checks
- **Resilient**: Handles email failures gracefully without interrupting the service
- **Configurable**: Uses environment variables for email configuration

## How It Works

### 1. Scheduled Execution
- The system uses `node-cron` to schedule checks every hour at minute 0
- Pattern: `0 * * * *` (Every hour at minute 0)
- Function: [checkUpcomingDeadlines()](file:///C:/Users/shubh/OneDrive/Desktop/Treasure/Taskify/backend/services/emailReminderService.js#L57-L121)

### 2. Deadline Detection
- Checks for tasks and subtasks due within the next 4 hours
- Only considers incomplete items (completed = false for tasks, status ≠ 'Completed' for subtasks)
- Queries the database for matching items

### 3. Email Notification
- Sends reminders to:
  - Task owners
  - Assigned users (for tasks and subtasks)
- Uses the same email configuration as the welcome email system
- Includes task/subtask details in the email content

### 4. Error Handling
- Email failures are logged but don't interrupt the process
- Database connection issues are handled gracefully
- System continues to run even if individual emails fail

## Technical Implementation

### Components
1. **Email Service**: [services/emailReminderService.js](file:///C:/Users/shubh/OneDrive/Desktop/Treasure/Taskify/backend/services/emailReminderService.js)
2. **Scheduling**: Integrated in [server.js](file:///C:/Users/shubh/OneDrive/Desktop/Treasure/Taskify/backend/server.js)
3. **Models**: Uses [taskModel.js](file:///C:/Users/shubh/OneDrive/Desktop/Treasure/Taskify/backend/models/taskModel.js) and [subtaskModel.js](file:///C:/Users/shubh/OneDrive/Desktop/Treasure/Taskify/backend/models/subtaskModel.js)

### Key Functions
- [checkUpcomingDeadlines()](file:///C:/Users/shubh/OneDrive/Desktop/Treasure/Taskify/backend/services/emailReminderService.js#L57-L121): Main function that checks for upcoming deadlines
- [sendEmailReminder()](file:///C:/Users/shubh/OneDrive/Desktop/Treasure/Taskify/backend/services/emailReminderService.js#L23-L46): Sends individual email reminders
- [scheduleEmailReminders()](file:///C:/Users/shubh/OneDrive/Desktop/Treasure/Taskify/backend/services/emailReminderService.js#L124-L132): Sets up the cron schedule

## Testing

### Automated Tests
Several test scripts are available to verify the system:

1. **Basic Test**: `node test-reminder-service.js`
   - Verifies database connection
   - Tests deadline checking function
   - Validates email configuration

2. **Comprehensive Test**: `node test-reminder-comprehensive.js`
   - Creates test data
   - Verifies end-to-end functionality
   - Cleans up test data

3. **Cron Schedule Test**: `node test-cron-schedule.js`
   - Verifies cron scheduling
   - Shows upcoming run times

## Configuration

The reminder system uses the same email configuration as the welcome email system:

- `EMAIL_USER`: Gmail address for sending emails
- `EMAIL_PASS`: Gmail App Password (not regular password)

## Troubleshooting

### Common Issues
1. **Emails not sending**: Check email configuration in [.env](file:///C:/Users/shubh/OneDrive/Desktop/Treasure/Taskify/backend/.env) file
2. **No reminders**: Verify cron scheduling is working (check server logs)
3. **Database errors**: Ensure MongoDB connection is stable

### Logs
The system logs important events:
- "Checking for upcoming deadlines..."
- "Found X upcoming tasks and Y upcoming subtasks"
- "Sent reminders for X tasks and Y subtasks"
- Error messages for failed operations

## Best Practices

1. **Email Configuration**: Use Gmail App Passwords, not regular passwords
2. **Server Uptime**: Keep the server running for consistent reminder delivery
3. **Monitoring**: Check logs regularly for errors
4. **Testing**: Run test scripts after configuration changes

## Future Enhancements

Potential improvements:
1. Configurable reminder time window (currently fixed at 4 hours)
2. Multiple reminder intervals (e.g., 1 day, 4 hours, 1 hour before deadline)
3. SMS notifications in addition to email
4. User preferences for notification frequency