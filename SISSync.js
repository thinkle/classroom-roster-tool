/* global getSyncSetting, initializeTermSettings, resolveTermSettingsForClass, isAfterDate, applyTermSettingsToParams, getSISClassesWithFilter, getGoogleClassroomCreateParams, gatherClassroomData, createCourse, iacsStandardConverter, iacsTestConverter, SISClassesSheet, SISTermSettingsSheet, SyncHistorySheet, StudentEnrollmentsSheet, SISSyncSettingsSheet, initializeSyncSettings, getSyncedClass, recordSISClass, logOperation */

// Orchestration for preview/create/bulk flows and status

function getDefaultConverter() {
  const converterName = getSyncSetting("defaultConverter", "iacsStandardConverter");
  switch (converterName) {
    case "iacsStandardConverter":
      return iacsStandardConverter;
    case "iacsTestConverter":
      return iacsTestConverter;
    default:
      return iacsStandardConverter;
  }
}

function extractSchoolId(sisClass) {
  if (sisClass.school && sisClass.school.sourcedId) return sisClass.school.sourcedId;
  return "";
}

function generateBatchId() {
  return `batch_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;
}

function previewClass(sisClassId, params = {}, converter = null) {
  logOperation("SISSync", "previewClass", `start id=${sisClassId}`);
  const { sisClass } = gatherClassroomData(sisClassId);
  logOperation("SISSync", "previewClass", `gathered id=${sisClassId}`);
  const finalConverter = converter || getDefaultConverter();
  let termResolvedSettings = applyTermSettingsToParams(sisClass, params);
  const effectiveParams = termResolvedSettings.params;
  const courseParams = getGoogleClassroomCreateParams(sisClass.sourcedId, effectiveParams, finalConverter);
  logOperation("SISSync", "previewClass", `paramsReady id=${sisClassId}`);
  if (termResolvedSettings.createEnabled) {
    // Write planned values into gc* columns without creating a course
    recordSISClass(sisClass, "preview", {
      gcName: courseParams.name || "",
      gcDescription: courseParams.description || courseParams.descriptionHeading || "",
      gcOwnerEmail: courseParams.ownerId || (params && params.ownerId) || "",
      gcCourseState: courseParams.courseState || "",
      gcGuardiansEnabled: typeof courseParams.guardiansEnabled === "boolean" ? courseParams.guardiansEnabled : ""
    });
    logOperation("SISSync", "previewClass", `recorded id=${sisClassId}`);
  } else {
    console.log('Class not enabled: ', termResolvedSettings, sisClassId);
  }
  return { success: true, sisClassId, preview: courseParams };
}

function previewClasses(filter = {}, params = {}, converter = null) {
  logOperation("SISSync", "previewClasses", "start");
  const batchId = generateBatchId();
  const classes = getSISClassesWithFilter(filter);
  logOperation("SISSync", "previewClasses", `fetched classes=${classes.length}`);
  const results = classes.map(c => previewClass(c.sourcedId, { ...params, batchId }, converter));
  logOperation("SISSync", "previewClasses", `done results=${results.length}`);
  return results;
}

function createAndLogCourseIfNotAlreadyCreated(sisClassId, params = {}, converter = null) {
  const existing = getSyncedClass(sisClassId);
  if (existing && existing.syncStatus === "created" && existing.gcId) {
    return { success: true, alreadyExists: true, sisClassId, classroomId: existing.gcId, message: "Classroom already exists" };
  }

  const classroomData = gatherClassroomData(sisClassId);
  const termResolvedSettings = applyTermSettingsToParams(classroomData.sisClass, params);

  if (termResolvedSettings.createEnabled) {
    recordSISClass(classroomData.sisClass, "pending");
    const finalConverter = converter || getDefaultConverter();

    const effectiveParams = termResolvedSettings.params;
    const classroom = createCourse(sisClassId, effectiveParams, finalConverter);
    recordSISClass(classroomData.sisClass, "created", {
      gcId: classroom.id,
      gcCourseState: classroom.courseState,
      gcOwnerEmail: effectiveParams.ownerId,
      gcGuardiansEnabled: effectiveParams.guardiansEnabled
    });
    return { success: true, alreadyExists: false, sisClassId, classroomId: classroom.id, classroom };
  } else {
    return {
      success: true, skipped: true, sisClassId, message: "Skipped by term settings"
    };
  }
}

function bulkSyncClasses(filter = {}, params = {}, converter = null) {
  const batchId = generateBatchId();
  const classes = getSISClassesWithFilter(filter);
  const results = [];
  classes.forEach(sisClass => {
    try {
      results.push(createAndLogCourseIfNotAlreadyCreated(sisClass.sourcedId, { ...params, batchId }, converter));
    } catch (e) {
      results.push({ success: false, sisClassId: sisClass.sourcedId, error: e.message });
    }
  });
  return results;
}

function stageTermSettingsAndPreview() {
  logOperation("SISSync", "stageTermSettingsAndPreview", "initTermSettings");
  initializeTermSettings();
  const filter = { schools: getSyncSetting("enabledSchools", "").split(",").filter(Boolean) };
  logOperation("SISSync", "stageTermSettingsAndPreview", `filter schools=${(filter.schools || []).length}`);
  const res = previewClasses(filter, {}, getDefaultConverter());
  logOperation("SISSync", "stageTermSettingsAndPreview", `done previews=${res.length}`);
  return res;
}

function initializeSISSyncSystem() {
  // Create/format sheets through their modules
  SISClassesSheet().reset(); SISClassesSheet().format();
  SISTermSettingsSheet().reset(); SISTermSettingsSheet().format();
  SyncHistorySheet().reset(); SyncHistorySheet().format();
  StudentEnrollmentsSheet().reset(); StudentEnrollmentsSheet().format();
  SISSyncSettingsSheet().reset(); SISSyncSettingsSheet().format();
  initializeSyncSettings();
  return { success: true };
}

function getSyncStatusReport() {
  const classes = SISClassesSheet();
  const all = classes.read();
  return {
    total: all.length,
    created: all.filter(c => c.syncStatus === "created").length,
    preview: all.filter(c => c.syncStatus === "preview").length,
    pending: all.filter(c => c.syncStatus === "pending").length,
    failed: all.filter(c => c.syncStatus === "failed").length,
    skipped: all.filter(c => c.syncStatus === "skipped").length
  };
}

// Expose orchestrators for menu and cross-file access in GAS
this.extractSchoolId = extractSchoolId;
this.bulkSyncClasses = bulkSyncClasses;
this.stageTermSettingsAndPreview = stageTermSettingsAndPreview;
this.initializeSISSyncSystem = initializeSISSyncSystem;
this.getSyncStatusReport = getSyncStatusReport;
