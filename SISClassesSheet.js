/* global SpreadsheetApp, JsonSheet, SHL, extractSchoolId */

// SIS Classes tracking sheet and helpers

let cachedSISClassesSheet = null;

function SISClassesSheet() {
  if (!cachedSISClassesSheet) {
    cachedSISClassesSheet = JsonSheet({
      sheetName: "SIS Classes",
      headers: [
        "sisClassId",
        "sisTitle",
        "sisClassCode",
        "sisCourseCode",
        "sisSchoolId",
        "sisSchoolYear",
        "sisTerms",
        "sisTermCodes",
        "sisLocation",
        "sisPeriods",
        "gcName",
        "gcDescription",
        "gcOwnerEmail",
        "gcCourseState",
        "gcGuardiansEnabled",
        "gcId",
        "lastSyncAttempt",
        "syncStatus",
        "syncError",
        "notes",
        "lastAddedStudents",
        "lastAddedTeachers",
      ],
      format: function (sheet) {
        sheet.autoResizeColumns(1, 25);
        sheet.setFrozenRows(1);
        sheet.setFrozenColumns(1);

        const headerRange = sheet.getRange(1, 1, 1, 25);
        headerRange.setBackground("#34a853");
        headerRange.setFontColor("white");
        headerRange.setFontWeight("bold");

        const dataRange = sheet.getRange(2, 18, sheet.getMaxRows() - 1, 1); // syncStatus column
        const createdRule = SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("created").setBackground("#d9ead3").setRanges([dataRange]).build();
        const failedRule = SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("failed").setBackground("#f4cccc").setRanges([dataRange]).build();
        const pendingRule = SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("pending").setBackground("#fff2cc").setRanges([dataRange]).build();
        const previewRule = SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("preview").setBackground("#cfe2f3").setRanges([dataRange]).build();
        sheet.setConditionalFormatRules([createdRule, failedRule, pendingRule, previewRule]);
      }
    });
  }
  return cachedSISClassesSheet;
}

function clearSISClassCache() {
  cachedSISClassesSheet = null;
}

let cachedSISClassesTable = null;

function getSISClassesTable() {
  if (!cachedSISClassesTable) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("SIS Classes");
    if (!sheet) { throw new Error("SIS Classes sheet not found"); }
    cachedSISClassesTable = SHL.Table(sheet.getDataRange(), "sisClassId");
  }
  return cachedSISClassesTable;
}

function getSyncedClass(sisClassId) {
  const table = getSISClassesTable();
  return table.getRow(String(sisClassId)) || null;
}

function recordSISClass(sisClass, status = "pending", result = null) {
  const classes = getSISClassesTable();
  const row = {
    sisClassId: sisClass.sourcedId,
    sisTitle: sisClass.title,
    sisClassCode: sisClass.classCode,
    sisCourseCode: (sisClass.course && sisClass.course.courseCode) ? sisClass.course.courseCode : "",
    sisSchoolId: extractSchoolId(sisClass),
    sisSchoolYear: sisClass.schoolYearTitle || "",
    sisTerms: (sisClass.termTitles && sisClass.termTitles.join) ? sisClass.termTitles.join(", ") : "",
    sisTermCodes: (sisClass.termCodes && sisClass.termCodes.join) ? sisClass.termCodes.join(", ") : "",
    sisLocation: sisClass.location || "",
    sisPeriods: (sisClass.periods && sisClass.periods.join) ? sisClass.periods.join(", ") : "",
    gcName: result && result.classroom ? result.classroom.name : (result && result.gcName) || "",
    gcDescription: result && result.gcDescription ? result.gcDescription : "",
    gcOwnerEmail: (result && (result.ownerId || result.gcOwnerEmail)) ? (result.ownerId || result.gcOwnerEmail) : "",
    gcCourseState: result && result.classroom ? result.classroom.courseState : (result && (result.courseState || result.gcCourseState)) || "",
    gcGuardiansEnabled: (result && (typeof result.guardiansEnabled !== "undefined" || typeof result.gcGuardiansEnabled !== "undefined")) ? (typeof result.guardiansEnabled !== "undefined" ? result.guardiansEnabled : result.gcGuardiansEnabled) : "",
    gcId: result && (result.classroom && result.classroom.id ? result.classroom.id : (result.gcId || "")),
    lastSyncAttempt: new Date().toISOString(),
    syncStatus: status,
    syncError: (result && result.error) ? result.error : "",
    notes: ""
  };
  classes.updateRow(row);
}
