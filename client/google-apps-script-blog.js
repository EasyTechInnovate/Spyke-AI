// Blog Lead Form Google Apps Script (separate from contact form)
// Deploy THIS file's code as a NEW Web App (execute as: Me, access: Anyone)
// Sheet columns expected (row 1): Name | Email | Phone | Needs | Timestamp | BlogSlug (optional)

function doPost(e) {
  try {
    var SHEET_ID = '1Rrfp8YOZIn5yuU0lPszh-4AR4wThkPNn1TC6CxnJjik'; // Blog sheet ID
    var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet(); // Or use getSheetByName('Sheet1') if needed

    if (!e.postData || !e.postData.contents) {
      Logger.log('No postData received');
      return _json({ success: false, message: 'No data' });
    }

    var raw = e.postData.contents;
    var data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      Logger.log('JSON parse error: ' + err + ' RAW=' + raw);
      return _json({ success: false, message: 'Invalid JSON' });
    }

    // Normalize keys (accept capitalized or lowercase, fallback to blank)
    var Name = data.Name || data.name || '';
    var Email = data.Email || data.email || '';
    var Phone = data.Phone || data.phone || '';
    var Needs = data.Needs || data.needs || data.message || data.subject || '';
    var BlogSlug = data.BlogSlug || data.blogSlug || '';

    // Basic validation (optional – adjust as needed)
    if (!Name || !Email || !Needs) {
      Logger.log('Validation failed: ' + JSON.stringify({ Name: Name, Email: Email, Needs: Needs }));
      return _json({ success: false, message: 'Missing required fields' });
    }

    sheet.appendRow([Name, Email, Phone, Needs, new Date(), BlogSlug]);

    return _json({ success: true, message: 'Lead stored' });
  } catch (err) {
    Logger.log('Unhandled error: ' + err + '\n' + (err && err.stack));
    return _json({ success: false, message: 'Server error' });
  }
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// One-time helper to set headers (run manually in Apps Script editor)
function setupBlogSheetHeaders() {
  var SHEET_ID = '1Rrfp8YOZIn5yuU0lPszh-4AR4wThkPNn1TC6CxnJjik';
  var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  var headers = ['Name', 'Email', 'Phone', 'Needs', 'Timestamp', 'BlogSlug'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold').setBackground('#222831').setFontColor('#ffffff');
  sheet.autoResizeColumns(1, headers.length);
}

function doGet(e) {
  return _json({ status: 'ok', service: 'Blog Lead API' });
}
