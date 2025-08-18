/* global SpreadsheetApp, JsonSheet, SHL, getSISTermsForSchool, getSyncSetting, extractSchoolId */

// SIS Term Settings sheet and helpers

function SISTermSettingsSheet() {
  return JsonSheet({
    sheetName: "SIS Term Settings",
    headers: [
      "enabled",
      "termKey",
      "schoolYear",
      "schoolId",
      "termCode",
      "termTitle",
      "termStartDate",
      "termEndDate",
      "defaultCourseState",
      "createCoursesAfter",
      "addStudentsAfter",
      "autoAddStudents",
      "guardiansEnabled"
    ],
    format: function (sheet) {
      sheet.autoResizeColumns(1, 13);
      sheet.setFrozenRows(1);
      sheet.setFrozenColumns(1);
      const headerRange = sheet.getRange(1, 1, 1, 13);
      headerRange.setBackground("#607d8b");
      headerRange.setFontColor("white");
      headerRange.setFontWeight("bold");

      // Enable checkbox on the Enabled column for all data rows
      const maxRows = sheet.getMaxRows();
      if (maxRows > 1) {
        const enabledRange = sheet.getRange(2, 1, maxRows - 1, 1);
        const rule = SpreadsheetApp.newDataValidation().requireCheckbox().build();
        enabledRange.setDataValidation(rule);
      }
    }
  });
}

let cachedSISTermSettingTable = null;

function getSISTermSettingsTable() {
  if (cachedSISTermSettingTable) {
    return cachedSISTermSettingTable;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("SIS Term Settings");
  if (!sheet) { throw new Error("SIS Term Settings sheet not found"); }
  const table = SHL.Table(sheet.getDataRange(), "termKey");
  if (!table.headers || table.headers.indexOf("termKey") === -1) {
    throw new Error("SIS Term Settings sheet not initialized with headers");
  }
  cachedSISTermSettingTable = table;
  return table;
}



function initializeTermSettings() {
  const sheet = SISTermSettingsSheet();

  // Ensure header order is current (enabled first); if not, reset and format
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName("SIS Term Settings");
    if (sh) {
      const hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] || [];
      if (!hdr.length || String(hdr[0]).toLowerCase() !== "enabled") {
        sheet.reset();
        sheet.format();
      }
    } else {
      sheet.reset();
      sheet.format();
    }
  } catch (e) {
    // Fallback
    sheet.reset();
    sheet.format();
  }

  const termTable = getSISTermSettingsTable();
  const enabledSchools = getSyncSetting("enabledSchools", "").split(",").filter(Boolean);
  const currentYear = getSyncSetting("currentSchoolYear", "");
  const defaults = {
    defaultCourseState: getSyncSetting("defaultCourseState", "PROVISIONED"),
    autoAddStudents: getSyncSetting("autoAddStudents", "false") === "true",
    guardiansEnabled: true,
    enabled: false
  };

  let seeded = 0;
  enabledSchools.forEach(schoolId => {
    try {
      const terms = getSISTermsForSchool(schoolId) || [];
      terms.forEach(t => {
        const schoolYear = t.schoolYear || currentYear || `${t.startDate}-${t.endDate}`;
        const termCode = t.termCode || "";
        const termTitle = t.title || "";
        const termKey = t.sourcedId;
        if (!termTable.hasRow(termKey)) {
          termTable.updateRow({
            enabled: defaults.enabled,
            termKey,
            schoolYear,
            schoolId,
            termCode,
            termTitle,
            termStartDate: t.startDate || "",
            termEndDate: t.endDate || "",
            defaultCourseState: defaults.defaultCourseState,
            createCoursesAfter: "",
            addStudentsAfter: "",
            autoAddStudents: defaults.autoAddStudents,
            guardiansEnabled: defaults.guardiansEnabled
          });
          seeded += 1;
        }
      });
    } catch (e) {
      console.warn(`[Term Settings] Failed to fetch terms for school ${schoolId}: ${e && e.message}`);
    }
  });

  console.log(`[Term Settings] Seeded ${seeded} term rows`);
  return { success: true, seeded };
}

function resolveTermSettingsForClass(sisClass) {
  try {
    const table = getSISTermSettingsTable();
    const terms = sisClass.terms || [];

    let foundDisabled = false;
    for (let i = 0; i < terms.length; i++) {

      const key = terms[i].sourcedId; //buildTermKey(schoolYear, schoolId, codes[i] || "");
      const row = table.getRow(key);
      if (!row) { continue; }
      const enabled = row.enabled;
      if (enabled) {

        let settings = {
          defaultCourseState: row.defaultCourseState || getSyncSetting("defaultCourseState", "PROVISIONED"),
          createCoursesAfter: row.createCoursesAfter || "",
          addStudentsAfter: row.addStudentsAfter || "",
          autoAddStudents: (row.autoAddStudents === true || row.autoAddStudents === 1 || String(row.autoAddStudents).toLowerCase() === "true"),
          guardiansEnabled: (row.guardiansEnabled === true || row.guardiansEnabled === 1 || String(row.guardiansEnabled).toLowerCase() === "true"),
          enabled: true
        };
        logOperation('SISTermSettingsSheet', 'resolveTermSettingsForClass', `Term ${key} is enabled: ${JSON.stringify(settings, null, 2)}`);
        return settings;
      } else {
        logOperation('SISTermSettingsSheet', 'resolveTermSettingsForClass', `Term ${key} is disabled`);
        foundDisabled = true;

      }
    }
    if (foundDisabled) {
      const settings = {
        //  defaultCourseState: getSyncSetting("defaultCourseState", "PROVISIONED"),
        createCoursesAfter: "",
        addStudentsAfter: "",
        autoAddStudents: getSyncSetting("autoAddStudents", "false") === "true",
        guardiansEnabled: true,
        enabled: false
      };
      logOperation('SISTermSettingsSheet', 'resolveTermSettingsForClass', `Term ${terms[0].sourcedId} is disabled: ${JSON.stringify(settings, null, 2)}`);
      return settings;
    }
  } catch (e) {
    console.warn(`[Term Settings] Resolve failed, using globals: ${e && e.message}`);
  }
  return {
    defaultCourseState: getSyncSetting("defaultCourseState", "PROVISIONED"),
    createCoursesAfter: "",
    addStudentsAfter: "",
    autoAddStudents: getSyncSetting("autoAddStudents", "false") === "true",
    guardiansEnabled: true,
    enabled: true
  };
}

function isAfterDate(dateStr) {
  if (!dateStr) return true;
  const now = new Date();
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  return now.getTime() >= d.getTime();
}

function applyTermSettingsToParams(sisClass, params = {}) {
  const ts = resolveTermSettingsForClass(sisClass);
  return {
    createEnabled: ts.enabled && isAfterDate(ts.createCoursesAfter),
    studentsEnabled: ts.enabled && ts.autoAddStudents && isAfterDate(ts.addStudentsAfter),
    params: {
      ...params,
      courseState: params.courseState || ts.defaultCourseState,
      guardiansEnabled: (typeof params.guardiansEnabled === "boolean") ? params.guardiansEnabled : ts.guardiansEnabled
    }
  };
}
