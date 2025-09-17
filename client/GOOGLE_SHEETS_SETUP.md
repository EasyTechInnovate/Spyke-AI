# SpykeAI Contact Form - Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for your SpykeAI contact form. All form submissions will be automatically saved to a Google Sheet using Google Apps Script.

## 📋 Prerequisites

- Google account
- Access to Google Sheets and Google Apps Script
- Basic understanding of copying/pasting code

## 🚀 Step-by-Step Setup

### Step 1: Create Google Sheet

1. **Open Google Sheets**
   - Go to [sheets.google.com](https://sheets.google.com)
   - Click "Blank" to create a new spreadsheet

2. **Set up the Sheet**
   - Rename the sheet to "SpykeAI Contact Submissions"
   - In row 1, add these headers (A1 to E1):
     ```
     A1: Name
     B1: Email
     C1: Subject
     D1: Message
     E1: Timestamp
     ```

3. **Get Sheet ID**
   - From your Google Sheet URL, copy the sheet ID:
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the `SHEET_ID_HERE` part (it's a long string of letters and numbers)
   - **IMPORTANT:** Save this ID in a notepad - you'll need it in Step 3

### Step 2: Create Google Apps Script

1. **Open Google Apps Script**
   - Go to [script.google.com](https://script.google.com)
   - Click "New Project"

2. **Replace Default Code**
   - Delete all existing code in the editor
   - Copy and paste this exact code:

```javascript
function doPost(e) {
  try {
    // Replace with your actual Google Sheet ID from Step 1
    const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);

    // Add data to sheet with timestamp
    const timestamp = new Date();
    sheet.appendRow([
      data.name || '',
      data.email || '',
      data.subject || '',
      data.message || '',
      timestamp
    ]);

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Message sent successfully!'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error:', error);

    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error sending message. Please try again.'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Test function to verify the script works
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'running',
      message: 'SpykeAI Contact Form API is active'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Function to set up the headers in your Google Sheet (run this once)
function setupSheetHeaders() {
  try {
    const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

    // Set headers in the first row
    const headers = ['Name', 'Email', 'Subject', 'Message', 'Timestamp'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Format the header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');

    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);

    console.log('Sheet headers set up successfully!');
  } catch (error) {
    console.error('Error setting up headers:', error);
  }
}
```

3. **Update the Sheet ID**
   - Find line 4: `const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';`
   - Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Sheet ID from Step 1
   - **ALSO** find line 40: `const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';`
   - Replace this one too with the same Sheet ID
   - Save the project (Ctrl+S or Cmd+S)

4. **Name Your Project**
   - Click "Untitled project" at the top
   - Rename to "SpykeAI Contact Form API"

5. **Run Setup Function (Important!)**
   - In the function dropdown at the top, select `setupSheetHeaders`
   - Click the "Run" button (play icon)
   - This will automatically create the proper headers in your Google Sheet

### Step 3: Deploy the Script

1. **Start Deployment**
   - Click "Deploy" button (top right)
   - Select "New deployment"

2. **Configure Deployment**
   - Type: Select "Web app"
   - Description: "SpykeAI Contact Form Handler"
   - Execute as: "Me (your-email@gmail.com)"
   - Who has access: "Anyone"

3. **Authorize the Script**
   - Click "Deploy"
   - You'll see an authorization screen
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to SpykeAI Contact Form API (unsafe)"
   - Click "Allow"

4. **Copy the Web App URL**
   - After deployment, you'll get a Web App URL
   - It looks like: `https://script.google.com/macros/s/SCRIPT_ID_HERE/exec`
   - **VERY IMPORTANT:** Copy this entire URL and save it in notepad
   - You'll need this URL for the next step

5. **Test the Deployment**
   - Click on the Web App URL you just copied
   - You should see: `{"status":"running","message":"SpykeAI Contact Form API is active"}`
   - If you see this, the script is working correctly!

### Step 4: Update SpykeAI Contact Form Code

1. **Open Contact Form File**
   - Navigate to `/client/app/(public)/contactus/page.jsx`
   - Find line 159 (around the `GOOGLE_SCRIPT_URL` variable)

2. **Replace the URL**
   ```javascript
   // Find this line:
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec'

   // Replace with your actual Web App URL from Step 3:
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID_FROM_STEP_3/exec'
   ```

3. **Save the File**
   - Save the page.jsx file
   - Restart your development server: `npm run dev`

4. **Important Notes**
   - The URL should look exactly like the one you copied in Step 3
   - Make sure there are no extra spaces or characters
   - Keep the single quotes around the URL

## ✅ Testing the Integration

### Final Test - Contact Form Submission
1. **Open SpykeAI Website**
   - Go to your website: `http://localhost:3000` (or your domain)
   - Navigate to the Contact Us page

2. **Fill Out Test Form**
   - Name: "Test User"
   - Email: "test@example.com"
   - Subject: "Support"
   - Message: "This is a test message from the contact form"

3. **Submit and Verify**
   - Click "Send Message"
   - You should see a success message
   - Go to your Google Sheet
   - A new row should appear with your test data and timestamp

### If Something Goes Wrong
- Check the Google Apps Script execution logs
- Verify the Sheet ID is correct in both places
- Make sure the Web App URL is exactly copied
- Ensure your Google Sheet has the correct headers

## 🔧 Troubleshooting

### Common Issues

**Error: "Script function not found"**
- Make sure you saved the Apps Script project
- Verify the `doPost` function exists and is spelled correctly

**Form submits but no data in sheet**
- Double-check the Sheet ID in your Apps Script (both lines 4 and 40)
- Ensure the Web App URL is correctly set in page.jsx line 159
- Check Apps Script execution logs for errors

**Authorization errors**
- Re-run the authorization process in Step 3
- Make sure "Anyone" has access to the Web App

**CORS errors in browser console**
- This is normal due to `no-cors` mode
- The form should still work despite console warnings
- Don't worry about these errors

### Viewing Execution Logs
1. In Google Apps Script, click "Executions" (left sidebar)
2. View recent executions and any error messages
3. Click on individual executions to see detailed logs

## 📊 Managing Your Data

### Viewing Submissions
- All form submissions appear in your Google Sheet
- Data includes: Name, Email, Subject, Message, and Timestamp
- Sort by timestamp to see newest submissions first

### Exporting Data
- File → Download → Excel (.xlsx) or CSV
- Use Google Sheets built-in sharing and collaboration features

### Setting Up Email Notifications (Recommended)
1. In your Google Sheet, go to Tools → Notification rules
2. Select "Any changes are made"
3. Choose email frequency (immediately recommended)
4. You'll get an email every time someone submits the contact form

## 🔐 Security Notes

- The Apps Script runs under your Google account
- Form data is stored in your private Google Sheet
- Only you have access to the submissions
- The Web App URL can be regenerated if needed (Deploy → Manage deployments)

## 🎉 Congratulations!

Your SpykeAI contact form is now connected to Google Sheets! Every submission will be automatically saved with a timestamp, making it easy to track and respond to customer inquiries.

### What Happens Next:
1. Customer fills out contact form on your website
2. Data is automatically sent to your Google Sheet
3. You get an email notification (if set up)
4. You can respond to the customer directly

---