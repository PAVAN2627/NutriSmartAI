function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    MailApp.sendEmail({
      to: data.email,
      subject: data.subject,
      htmlBody: data.html || undefined,
      body: data.message || undefined,
      name: "NutriSmart AI"
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput("NutriSmart AI Email Service Active")
    .setMimeType(ContentService.MimeType.TEXT);
}
