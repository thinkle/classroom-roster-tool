/* global SpreadsheetApp, HtmlService, getSISSchools, getSyncSetting, setSyncSetting, getDefaultConverter, initializeSISSyncSystem, initializeTermSettings, stageTermSettingsAndPreview, previewClasses, bulkSyncClasses, getSISClassesWithFilter, getSISClassesTable, resolveTermSettingsForClass, isAfterDate, addStudentsToClass, logSyncOperation */

// Spreadsheet menu wiring and no-arg handlers for IACS flows


function setupTermMenus(ui) {
  ui.createMenu("SIS Sync")
    .addItem("Initialize Sheets", "initializeSISSyncSystem")
    .addItem("Seed Term Settings (from SIS)", "initializeTermSettings")
    .addItem("Set Up Schools to Sync", "openSetUpSchoolsDialog")
    .addSeparator()
    .addItem("Preview - IACS", "previewSISSyncCourseData")
    .addItem("Create - IACS", "createSISSyncClasses")
    .addItem("Add Students - IACS", "addSISSyncStudents")
    .addSeparator()
    .addItem("Status Report", "getSyncStatusReport")
    .addToUi();
}

// ===== Menu Handlers (no-arg, use IACS filter from settings) =====

function previewSISSyncCourseData() {
  // Seeds terms from SIS and writes preview values only
  return stageTermSettingsAndPreview();
}

function createSISSyncClasses() {
  const filter = { schools: getSyncSetting("enabledSchools", "").split(",").filter(Boolean) };
  const params = {};
  return bulkSyncClasses(filter, params, getDefaultConverter());
}

function addSISSyncStudents() {
  const filter = { schools: getSyncSetting("enabledSchools", "").split(",").filter(Boolean) };
  const classes = getSISClassesWithFilter(filter);
  const batchId = `students_${new Date().getTime()}`;
  let total = 0, added = 0, skipped = 0, failures = 0;
  const classTable = getSISClassesTable();

  classes.forEach(cls => {
    try {
      const ts = resolveTermSettingsForClass(cls);
      if (!ts.enabled || !ts.autoAddStudents || !isAfterDate(ts.addStudentsAfter)) {
        skipped += 1;
        return;
      }
      const row = classTable.getRow(cls.sourcedId);
      if (!row || !row.gcId) {
        skipped += 1;
        return;
      }

      const res = addStudentsToClass(row.gcId, cls.sourcedId);
      total += res.total || 0;
      added += res.added || 0;
      if (res.errors && res.errors.length) { failures += res.errors.length; }

      logSyncOperation("add_students", "success", {
        sisClassId: cls.sourcedId,
        classroomId: row.gcId,
        batchId,
        info: { added: res.added || 0, total: res.total || 0, errors: (res.errors || []).length }
      });
    } catch (e) {
      failures += 1;
      logSyncOperation("add_students", "failed", { sisClassId: cls.sourcedId, error: e.message, batchId });
    }
  });

  try {
    SpreadsheetApp.getActive().toast(`Added ${added}/${total}, skipped ${skipped}, failures ${failures}`, "SIS Sync", 5);
  } catch (e) {
    // Toast not available in some contexts; ignore
  }
  return { total, added, skipped, failures, batchId };
}

// ===== Schools selection dialog =====

function openSetUpSchoolsDialog() {
  let schoolsResponse;
  try {
    schoolsResponse = getSISSchools();
  } catch (e) {
    SpreadsheetApp.getUi().alert(`Failed to load schools from SIS: ${e && e.message ? e.message : e}`);
    return;
  }

  // Normalize possible payload shapes
  let items = [];
  if (schoolsResponse && Array.isArray(schoolsResponse)) {
    items = schoolsResponse;
  } else if (schoolsResponse && Array.isArray(schoolsResponse.schools)) {
    items = schoolsResponse.schools;
  } else if (schoolsResponse && Array.isArray(schoolsResponse.orgs)) {
    items = schoolsResponse.orgs;
  } else if (schoolsResponse && schoolsResponse.results && Array.isArray(schoolsResponse.results)) {
    items = schoolsResponse.results;
  }

  // Map to {id, name} and filter to type=school when present
  const schools = items
    .map(s => ({
      id: (s.sourcedId) || (s.school && s.school.sourcedId) || (s.org && s.org.sourcedId) || "",
      name: s.name || (s.org && s.org.name) || s.title || s.identifier || (s.metadata && s.metadata.name) || (s.metadata && s.metadata.title) || "Unnamed School",
      type: s.type || (s.org && s.org.type) || ""
    }))
    .filter(s => !!s.id && (!s.type || String(s.type).toLowerCase() === "school"));

  const preselected = getSyncSetting("enabledSchools", "").split(",").filter(Boolean);

  const html = `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: Arial, sans-serif; padding: 12px; }
    h2 { margin-top: 0; }
    .list { border: 1px solid #ddd; border-radius: 6px; padding: 8px; max-height: 360px; overflow: auto; }
    .item { padding: 6px 4px; }
    .actions { margin-top: 12px; display: flex; gap: 8px; }
    #filter { width: 100%; padding: 6px 8px; margin-bottom: 8px; box-sizing: border-box; }
    .muted { color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <h2>Set Up Schools to Sync</h2>
  <p class="muted">Select the schools to include in SIS sync workflows.</p>
  <input id="filter" type="text" placeholder="Filter schools..." oninput="applyFilter()"/>
  <div id="list" class="list">
    ${schools.map(s => `
      <div class="item">
        <label><input type="checkbox" name="schools" value="${s.id}" ${preselected.indexOf(String(s.id)) > -1 ? 'checked' : ''}/> ${s.name} <span class="muted">(${s.id})</span></label>
      </div>
    `).join("")}
  </div>
  <div class="actions">
    <button onclick="save()">Save</button>
    <button onclick="google.script.host.close()">Cancel</button>
  </div>
  <script>
    function applyFilter(){
      const q = document.getElementById('filter').value.toLowerCase();
      const items = Array.from(document.querySelectorAll('#list .item'));
      items.forEach(el => {
        const text = el.textContent.toLowerCase();
        el.style.display = text.indexOf(q)>-1 ? '' : 'none';
      });
    }
    function save(){
      const selected = Array.from(document.querySelectorAll('input[name="schools"]:checked')).map(cb => cb.value);
      google.script.run.withSuccessHandler(function(){
        google.script.host.close();
      }).saveSelectedSchools(selected);
    }
  </script>
</body>
</html>`;

  const output = HtmlService.createHtmlOutput(html).setWidth(420).setHeight(520);
  SpreadsheetApp.getUi().showModalDialog(output, "Set Up Schools to Sync");
}

function saveSelectedSchools(selectedIds) {
  const ids = Array.isArray(selectedIds) ? selectedIds : [];
  setSyncSetting("enabledSchools", ids.join(","), "Comma-separated list of school sourcedIds to include");
  try {
    SpreadsheetApp.getActive().toast(`Saved ${ids.length} school(s)`, "SIS Sync", 5);
  } catch (e) {
    // ignore toast failure
  }
  return { success: true, count: ids.length };
}
