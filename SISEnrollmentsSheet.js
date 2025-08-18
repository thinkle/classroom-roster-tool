/* global SpreadsheetApp, JsonSheet, SHL */

// Student Enrollments sheet and helpers

function StudentEnrollmentsSheet() {
  return JsonSheet({
    sheetName: "Student Enrollments",
    headers: [
      "enrollmentKey",
      "classroomId",
      "studentEmail",
      "studentName",
      "sisStudentId",
      "enrollmentDate",
      "enrollmentStatus",
      "sisClassId",
      "error",
      "batchId"
    ],
    format: function (sheet) {
      sheet.autoResizeColumns(1, 10);
      sheet.setFrozenRows(1);
      const headerRange = sheet.getRange(1, 1, 1, 10);
      headerRange.setBackground("#9c27b0");
      headerRange.setFontColor("white");
      headerRange.setFontWeight("bold");
    }
  });
}

function getStudentEnrollmentsTable() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Student Enrollments");
  if (!sheet) { throw new Error("Student Enrollments sheet not found"); }
  const table = SHL.Table(sheet.getDataRange(), "enrollmentKey");
  if (!table.headers || table.headers.indexOf("enrollmentKey") === -1) {
    throw new Error("Student Enrollments sheet not initialized with headers");
  }
  return table;
}

function computeEnrollmentKey(sisClassId, sisStudentId, studentEmail) {
  const idPart = sisStudentId && String(sisStudentId).trim();
  const emailPart = studentEmail && String(studentEmail).trim().toLowerCase();
  return `${sisClassId}:${idPart || emailPart || "unknown"}`;
}

function recordStudentEnrollment(entry, status, error = "", batchId = "") {
  const table = getStudentEnrollmentsTable();
  const key = computeEnrollmentKey(entry.sisClassId, entry.sisStudentId, entry.studentEmail);
  const existing = table.getRow(key);
  const enrollmentDate = (existing && existing.enrollmentStatus === "added") ? (existing.enrollmentDate || new Date().toISOString()) : (status === "added" ? new Date().toISOString() : "");

  table.updateRow({
    enrollmentKey: key,
    classroomId: entry.classroomId || "",
    studentEmail: entry.studentEmail || "",
    studentName: entry.studentName || "",
    sisStudentId: entry.sisStudentId || "",
    enrollmentDate,
    enrollmentStatus: status,
    sisClassId: entry.sisClassId || "",
    error: error || "",
    batchId: (existing && existing.batchId) ? existing.batchId : (batchId || "")
  });
}
