/* global SpreadsheetApp, JsonSheet, SHL, getSISClassesTable */

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

let cachedEnrollmentsTable = null;

function getStudentEnrollmentsTable() {
  if (cachedEnrollmentsTable) {
    return cachedEnrollmentsTable;
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Student Enrollments");
  if (!sheet) { throw new Error("Student Enrollments sheet not found"); }
  const table = SHL.Table(sheet.getDataRange(), "enrollmentKey");
  if (!table.headers || table.headers.indexOf("enrollmentKey") === -1) {
    throw new Error("Student Enrollments sheet not initialized with headers");
  }
  cachedEnrollmentsTable = table;
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


/**
 * Add students to an existing Google Classroom
 * @param {string} classroomId - Google Classroom ID
 * @param {string} sisClassId - SIS class ID to get students from
 * @returns {Object} Results of student additions
 */
function addStudentsToClass(classroomId, sisClassId, log = true) {
  let sisEnrollmentSheet = log && getStudentEnrollmentsTable();
  try {
    const students = getStudentsForClass(sisClassId);
    const results = {
      total: students.length,
      added: 0,
      errors: [],
    };

    for (const student of students) {
      let err;
      if (log) {
        let row = sisEnrollmentSheet.getRow(`${student.email}+${classroomId}`);
        if (row && row.enrollmentStatus === "added") {
          // Already added, skip          
          results.added++;
          console.log('Skipping already added student');
          continue;
        }
      }
      try {
        logOperation('SISEnrollmentSheet', 'Classroom.Courses.Students.create', 'adding student');
        Classroom.Courses.Students.create(
          {
            userId: student.email,
          },
          classroomId
        );

        results.added++;
      } catch (error) {
        err = error;
        results.errors.push({
          email: student.email,
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
        logOperation('SISEnrollmentSheet', 'sisEnrollmentSheet.updateRow', 'updating row');
        sisEnrollmentSheet.updateRow({
          enrollmentKey: `${student.email}+${classroomId}`,
          classroomId,
          studentEmail: student.email,
          studentName: `${student.givenName || ""} ${student.familyName || ""}`,
          sisStudentId: student.sourcedId || "",
          enrollmentDate: new Date().toISOString(),
          enrollmentStatus,
          error: err ? err.message : "",
        });
      }
    }

    if (log) {
      logOperation('SISEnrollmentSheet', 'sisClassesTable.updateRow', 'updating row with class-last-added...');
      let sisClassesTable = getSISClassesTable();
      sisClassesTable.updateRow({
        sisClassId,
        lastAddedStudents: new Date(),
      });
    }
    return results;
  } catch (error) {
    throw error;
  }
}
