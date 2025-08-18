/* global SpreadsheetApp, JsonSheet */

// Sync history log sheet and helpers

function SyncHistorySheet() {
  return JsonSheet({
    sheetName: "Sync History",
    headers: [
      "timestamp",
      "action",
      "status",
      "sisClassId",
      "classroomId",
      "batchId",
      "infoJson",
      "error"
    ],
    format: function (sheet) {
      sheet.autoResizeColumns(1, 8);
      sheet.setFrozenRows(1);
      const headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setBackground("#3949ab");
      headerRange.setFontColor("white");
      headerRange.setFontWeight("bold");
    }
  });
}

function logSyncOperation(action, status, details) {
  const sheet = SyncHistorySheet();
  const row = {
    timestamp: new Date().toISOString(),
    action: String(action),
    status: String(status),
    sisClassId: details && details.sisClassId ? String(details.sisClassId) : "",
    classroomId: details && details.classroomId ? String(details.classroomId) : "",
    batchId: details && details.batchId ? String(details.batchId) : "",
    infoJson: details && details.info ? JSON.stringify(details.info) : "",
    error: details && details.error ? String(details.error) : ""
  };
  sheet.update(row, "timestamp");
}
