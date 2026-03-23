# Email Configuration Setup Guide

This guide will help you properly configure email settings for Taskify's welcome email and reminder features.

## Required Configuration

To enable email functionality, you need to set two environment variables in your `.env` file:

1. `EMAIL_USER` - Your Gmail address
2. `EMAIL_PASS` - Your Gmail App Password (NOT your regular password)

## Step-by-Step Gmail Setup

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", make sure "2-Step Verification" is turned ON
   - If not, click on it and follow the steps to enable it

### Step 2: Generate an App Password
1. Still in the "Security" section, scroll down to "2-Step Verification"
2. Click on "App passwords" (you may need to sign in again)
3. Under "Select app", choose "Mail"
4. Under "Select device", choose "Other" and type "Taskify"
5. Click "Generate"
6. Google will display a 16-character code (e.g., `abcd xyzw 1234 efgh`)
7. Copy this code - this is your `EMAIL_PASS`

### Step 3: Update Your .env File
Open your `.env` file and update these lines:

```env
# Replace with your actual Gmail address
EMAIL_USER=yourname@gmail.com

# Replace with your Gmail App Password (the 16-character code)
EMAIL_PASS=abcd xyzw 1234 efgh
```

### Step 4: Test the Configuration
Run the test script to verify your configuration works:

```bash
cd backend
node comprehensive-email-test.js
```

## Common Issues and Solutions

### Issue: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Solution**: 
- Make sure you're using an App Password, not your regular Gmail password
- Verify that 2-Factor Authentication is enabled
- Generate a new App Password and try again

### Issue: "Error: connect ETIMEDOUT"
**Solution**:
- Check your internet connection
- Ensure Gmail services are accessible from your location
- Try using a different network

### Issue: "Error: Cannot find module 'dotenv'"
**Solution**:
- Run `npm install dotenv` in the backend directory

## Security Notes

- Never commit your `.env` file to version control
- The `.gitignore` file should already exclude `.env`
- App Passwords are specific to the app and device, so they're safer than regular passwords
- If you suspect your App Password is compromised, revoke it and generate a new one

## Testing Email Functionality

After configuring your credentials, you can test the email functionality by:

1. Running the comprehensive test:
   ```bash
   cd backend
   node comprehensive-email-test.js
   ```

2. Or manually testing by registering a new user through the application

## Need Help?

If you continue to have issues:
1. Double-check that you've followed all steps above
2. Verify your Gmail address is correct
3. Generate a new App Password
4. Check that your firewall/antivirus isn't blocking the connection