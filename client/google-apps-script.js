function doPost(e) {
  try {
    // Replace with your actual Google Sheet ID
    // Get this from your Google Sheet URL: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
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