function doGet(e) {
  Logger.log( Utilities.jsonStringify(e) );
  if (!e.parameter.page) {
    return HtmlService.createTemplateFromFile('index').evaluate();
  }
  // else, use page parameter to pick an html file from the script
  return HtmlService.createTemplateFromFile(e.parameter['page']).evaluate();
}

function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

function getAllCompetencyData(){
  var url = "https://docs.google.com/spreadsheets/d/1nP78lxzG6riZGcUguZHajLNZ3zk5Lwdp8dujpd5murA/edit#gid=0"
  var spreadsheet = SpreadsheetApp.openByUrl(url)
  var sheet = spreadsheet.getSheetByName("Competency")
  var dataSheet = sheet.getRange('A2:C').getValues().filter(
    function(row){
      return row.every(function(cell){
        return cell !== ""
      })
    }
  );
  Logger.log(dataSheet)

  return dataSheet
}

// Check for last uploaded or last updated file
function getUploadedFile() {
  // https://drive.google.com/drive/folders/1DFw2_YdiJcuOdKsavSR-GgGf66JeWn-Q?usp=drive_link
  var folderId = "1DFw2_YdiJcuOdKsavSR-GgGf66JeWn-Q"; // ID folder di Google Drive Anda di mana file-file diunggah
  var folder = DriveApp.getFolderById(folderId);

  var files = folder.getFiles();

  var first = true
  var lastUploadedTime = null
  var uploadedTime = null
  var spreadsheetUrl = null
  var fileId = null

  while (files.hasNext()) {
    var file = files.next();
    // Check kalau dia spreadsheet atau bukan
    if (file.getMimeType() == "application/vnd.google-apps.spreadsheet" || file.getMimeType() == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      // ambil lastUploaded pertama kalau baru pertama kali
      if (first) {
        lastUploadedTime = file.getLastUpdated()
        fileId = file.getId()
        spreadsheetUrl = "https://docs.google.com/spreadsheets/d/" + fileId
        first = false
        Logger.log("Uploaded Time: " + lastUploadedTime + "\nMime type: " + file.getMimeType())
      } else {
        uploadedTime = file.getLastUpdated();
        Logger.log("Uploaded Time: " + uploadedTime + "\nMime type: " + file.getMimeType())
      }

      Logger.log("Last Uploaded Time: " + lastUploadedTime + "\nUploaded Time: " + uploadedTime)
      if (lastUploadedTime < uploadedTime) {
        lastUploadedTime = uploadedTime
        fileId = file.getId()
        spreadsheetUrl = "https://docs.google.com/spreadsheets/d/" + fileId
        Logger.log("Upload Changed")
      }
    }

    // Lakukan pengecekan apakah file diunggah sejak pengecekan terakhir
    // Anda bisa membandingkan timestamp unggahan dengan timestamp dari pengecekan terakhir
    // Jika file diunggah setelah pengecekan terakhir, lakukan tindakan yang sesuai.
  }
  Logger.log("Sheets ID: " + fileId);
  Logger.log("Spreadsheet baru diunggah. URL: " + spreadsheetUrl);
  // Buka spreadsheet menggunakan ID file
  var spreadsheet = SpreadsheetApp.openById(fileId);

  // Dapatkan sheet dari spreadsheet
  var sheet = spreadsheet.getSheets()[0]; // Ubah indeksnya sesuai dengan sheet yang Anda inginkan

  // Ambil data dari sheet
  var dataSheet = sheet.getRange('A2:C').getValues().filter(
    function(row){
      return row.every(function(cell){
        return cell !== ""
      })
    }
  );
  
  Logger.log("Data spreadsheet : " + dataSheet)
  Logger.log(dataSheet)

  Logger.log("Finished")
  return dataSheet
}

function convertXLSXtoGoogleSheets(fileId) {
  // Specify the file ID of the Excel file stored in Google Drive
  
  // Fetch the Excel file from Google Drive
  var file = DriveApp.getFileById(fileId);
  
  // Get the blob of the file
  var blob = file.getBlob();
  
  // Convert Excel file blob to Google Sheets format
  var convertedFile = Drive.Files.insert({
    title: file.getName(),
    parents: [{id: "1DFw2_YdiJcuOdKsavSR-GgGf66JeWn-Q"}],
    mimeType: MimeType.GOOGLE_SHEETS
  }, blob);
  
  // Get the ID of the newly created Google Sheets document
  var newFileId = convertedFile.id;
  
  Logger.log("New Google Sheets file ID: " + newFileId)
  return newFileId
}

function InputDatabase(tableName, dataArray){
  const databaseId = "1nP78lxzG6riZGcUguZHajLNZ3zk5Lwdp8dujpd5murA"
  const database = SpreadsheetApp.openById(databaseId)

  var table = database.getSheetByName(tableName)

  table.appendRow(dataArray)
}

function addCompetencyData(competency, definition, category){
  var url = "https://docs.google.com/spreadsheets/d/1nP78lxzG6riZGcUguZHajLNZ3zk5Lwdp8dujpd5murA/edit#gid=0"
  var spreadsheet = SpreadsheetApp.openByUrl(url)
  var sheet = spreadsheet.getSheetByName("Competency")

  sheet.appendRow([competency, definition, category])
}

function deleteData(rowNum){
  var url = "https://docs.google.com/spreadsheets/d/1nP78lxzG6riZGcUguZHajLNZ3zk5Lwdp8dujpd5murA/edit#gid=0"
  var spreadsheet = SpreadsheetApp.openByUrl(url)
  var sheet = spreadsheet.getSheetByName("Competency")
  
  // rowNum sesuai nomor row yang ada di spreadsheet
  sheet.deleteRow(rowNum)
}