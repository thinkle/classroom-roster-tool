/* global getSyncSetting, initializeTermSettings, resolveTermSettingsForClass, isAfterDate, applyTermSettingsToParams, getSISClassesWithFilter, getGoogleClassroomCreateParams, gatherClassroomData, createCourse, iacsStandardConverter, iacsTestConverter, SISClassesSheet, SISTermSettingsSheet, SyncHistorySheet, StudentEnrollmentsSheet, SISSyncSettingsSheet, initializeSyncSettings, getSyncedClass, recordSISClass */

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
  const { sisClass } = gatherClassroomData(sisClassId);
  const finalConverter = converter || getDefaultConverter();
  const effectiveParams = applyTermSettingsToParams(sisClass, params);
  const courseParams = getGoogleClassroomCreateParams(sisClass.sourcedId, effectiveParams, finalConverter);

  // Write planned values into gc* columns without creating a course
  recordSISClass(sisClass, "preview", {
    gcName: courseParams.name || "",
    gcDescription: courseParams.description || courseParams.descriptionHeading || "",
    gcOwnerEmail: courseParams.ownerId || (params && params.ownerId) || "",
    gcCourseState: courseParams.courseState || "",
    gcGuardiansEnabled: typeof courseParams.guardiansEnabled === "boolean" ? courseParams.guardiansEnabled : ""
  });

  return { success: true, sisClassId, preview: courseParams };
}

function previewClasses(filter = {}, params = {}, converter = null) {
  const batchId = generateBatchId();
  const classes = getSISClassesWithFilter(filter);
  return classes.map(c => previewClass(c.sourcedId, { ...params, batchId }, converter));
}

function createAndLogCourseIfNotAlreadyCreated(sisClassId, params = {}, converter = null) {
  const existing = getSyncedClass(sisClassId);
  if (existing && existing.syncStatus === "created" && existing.gcId) {
    return { success: true, alreadyExists: true, sisClassId, classroomId: existing.gcId, message: "Classroom already exists" };
  }

  const classroomData = gatherClassroomData(sisClassId);
  const termSettings = resolveTermSettingsForClass(classroomData.sisClass);
  if (!termSettings.enabled || !isAfterDate(termSettings.createCoursesAfter)) {
    recordSISClass(classroomData.sisClass, "skipped");
    return { success: true, skipped: true, sisClassId, message: "Skipped by term settings" };
  }

  recordSISClass(classroomData.sisClass, "pending");
  const finalConverter = converter || getDefaultConverter();
  const effectiveParams = applyTermSettingsToParams(classroomData.sisClass, params);
  const classroom = createCourse(sisClassId, effectiveParams, finalConverter);

  recordSISClass(classroomData.sisClass, "created", {
    gcId: classroom.id,
    gcCourseState: classroom.courseState,
    gcOwnerEmail: effectiveParams.ownerId,
    gcGuardiansEnabled: effectiveParams.guardiansEnabled
  });

  return { success: true, alreadyExists: false, sisClassId, classroomId: classroom.id, classroom };
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
  initializeTermSettings();
  const filter = { schools: getSyncSetting("enabledSchools", "").split(",").filter(Boolean) };
  return previewClasses(filter, {}, getDefaultConverter());
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
