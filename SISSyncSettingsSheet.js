/* global SpreadsheetApp, JsonSheet, SHL */

// Global sync settings sheet and helpers

function SISSyncSettingsSheet() {
  return JsonSheet({
    sheetName: "SIS Sync Settings",
    headers: ["key", "value", "description"],
    format: function (sheet) {
      sheet.autoResizeColumns(1, 3);
      sheet.setFrozenRows(1);
      const headerRange = sheet.getRange(1, 1, 1, 3);
      headerRange.setBackground("#8e24aa");
      headerRange.setFontColor("white");
      headerRange.setFontWeight("bold");
    }
  });
}

function getSISSyncSettingsTable() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("SIS Sync Settings");
  if (!sheet) { throw new Error("SIS Sync Settings sheet not found"); }
  const table = SHL.Table(sheet.getDataRange(), "key");
  if (!table.headers || table.headers.indexOf("key") === -1) {
    throw new Error("SIS Sync Settings sheet not initialized with headers");
  }
  return table;
}

function initializeSyncSettings() {
  const sheet = SISSyncSettingsSheet();
  if (sheet.read().length === 0) { sheet.reset(); sheet.format(); }
  const table = getSISSyncSettingsTable();
  const defaults = [
    { key: "defaultConverter", value: "iacsStandardConverter", description: "Name of converter function to use by default" },
    { key: "enabledSchools", value: "", description: "Comma-separated list of school sourcedIds to include" },
    { key: "currentSchoolYear", value: "", description: "Display string for current school year, e.g. 2025-26" },
    { key: "defaultCourseState", value: "PROVISIONED", description: "Default Classroom courseState for new courses" },
    { key: "autoAddStudents", value: "false", description: "Whether to auto-add students when allow date passes" }
  ];
  defaults.forEach(d => {
    if (!table.hasRow(d.key)) { table.updateRow(d); }
  });
  return { success: true };
}

function getSyncSetting(key, defaultValue) {
  try {
    const table = getSISSyncSettingsTable();
    const row = table.getRow(key);
    if (row && typeof row.value !== "undefined") { return String(row.value); }
  } catch (e) {
    // ignore and return default
  }
  return (typeof defaultValue === "undefined") ? "" : defaultValue;
}

function setSyncSetting(key, value, description) {
  const table = getSISSyncSettingsTable();
  const row = { key: String(key), value: String(value) };
  if (typeof description !== "undefined") { row.description = String(description); }
  table.updateRow(row);
  return { success: true };
}
