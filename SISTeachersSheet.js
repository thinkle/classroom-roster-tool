/* global SpreadsheetApp, JsonSheet, SHL, Classroom, getTeachersForClass, getSISClassesTable */

// Teacher Enrollments sheet and helpers

function TeacherEnrollmentsSheet() {
  return JsonSheet({
    sheetName: "Teacher Enrollments",
    headers: [
      "enrollmentKey",
      "classroomId",
      "teacherEmail",
      "teacherName",
      "sisTeacherId",
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
      headerRange.setBackground("#4caf50");
      headerRange.setFontColor("white");
      headerRange.setFontWeight("bold");
    }
  });
}

let cachedTeachersTable = null;

function getTeacherEnrollmentsTable() {
  if (cachedTeachersTable) {
    return cachedTeachersTable;
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Teacher Enrollments");
  if (!sheet) { throw new Error("Teacher Enrollments sheet not found"); }
  const table = SHL.Table(sheet.getDataRange(), "enrollmentKey");
  if (!table.headers || table.headers.indexOf("enrollmentKey") === -1) {
    throw new Error("Teacher Enrollments sheet not initialized with headers");
  }
  cachedTeachersTable = table;
  return table;
}

function computeTeacherEnrollmentKey(sisClassId, sisTeacherId, teacherEmail) {
  const idPart = sisTeacherId && String(sisTeacherId).trim();
  const emailPart = teacherEmail && String(teacherEmail).trim().toLowerCase();
  return `${sisClassId}:${idPart || emailPart || "unknown"}`;
}

function recordTeacherEnrollment(entry, status, error = "", batchId = "") {
  const table = getTeacherEnrollmentsTable();
  const key = computeTeacherEnrollmentKey(entry.sisClassId, entry.sisTeacherId, entry.teacherEmail);
  const existing = table.getRow(key);
  const enrollmentDate = (existing && existing.enrollmentStatus === "added") ? (existing.enrollmentDate || new Date().toISOString()) : (status === "added" ? new Date().toISOString() : "");

  table.updateRow({
    enrollmentKey: key,
    classroomId: entry.classroomId || "",
    teacherEmail: entry.teacherEmail || "",
    teacherName: entry.teacherName || "",
    sisTeacherId: entry.sisTeacherId || "",
    enrollmentDate,
    enrollmentStatus: status,
    sisClassId: entry.sisClassId || "",
    error: error || "",
    batchId: (existing && existing.batchId) ? existing.batchId : (batchId || "")
  });
}


/**
 * Add teachers to an existing Google Classroom
 * @param {string} classroomId - Google Classroom ID
 * @param {string} sisClassId - SIS class ID to get teachers from
 * @returns {Object} Results of teacher additions
 */
function addTeachersToClass(classroomId, sisClassId, log = true) {
  let sisTeacherSheet = log && getTeacherEnrollmentsTable();
  try {
    const teachers = getTeachersForClass(sisClassId);
    const results = {
      total: teachers.length,
      added: 0,
      errors: [],
    };

    for (const teacher of teachers) {
      let err;
      if (log) {
        let row = sisTeacherSheet.getRow(`${teacher.email}+${classroomId}`);
        if (row && row.enrollmentStatus === "added") {
          // Already added, skip          
          results.added++;
          console.log('Skipping already added teacher');
          continue;
        }
      }
      try {
        Classroom.Courses.Teachers.create(
          {
            userId: teacher.email,
          },
          classroomId
        );

        results.added++;
      } catch (error) {
        err = error;
        results.errors.push({
          email: teacher.email,
          error: error.message,
        });
      }
      if (log) {
        let enrollmentStatus = "added";
        if (err) {
          enrollmentStatus = "error";
          if (err.message.includes("already exists")) {
            enrollmentStatus = "added";
          }
        }
        console.log('Logging teacher enrollment', teacher.email, enrollmentStatus, err ? err.message : '');
        sisTeacherSheet.updateRow({
          enrollmentKey: `${teacher.email}+${classroomId}`,
          classroomId,
          teacherEmail: teacher.email,
          teacherName: teacher.name || "",
          sisTeacherId: teacher.sisId || "",
          enrollmentDate: new Date().toISOString(),
          enrollmentStatus,
          error: err ? err.message : "",
        });
      }
    }

    if (log) {
      let sisClassesTable = getSISClassesTable();
      sisClassesTable.updateRow({
        sisClassId,
        lastAddedTeachers: new Date(),
      });
    }

    return results;
  } catch (error) {
    throw error;
  }
}
