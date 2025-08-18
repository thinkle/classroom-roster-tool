function fetchAllTheTeachers() {
  const cs = CoursesSheet();
  const courses = cs.read();
  const ts = TeachersSheet();
  let teachers = [];
  let first = true
  for (let course of courses) {
    if (first) {
      first = false // skip first row
    } else {
      if (!course.fetchedTeachers) {
        try {
          Classroom.Courses.Teachers.list(course.id).teachers.map((t) => ts.push({ ...t, email: t.profile.emailAddress, name: t.profile.name.fullName }))
          course.fetchedTeachers = true
        } catch (err) {
          course.fetchedTeachers = JSON.stringify(err);
        }
      }
    }
  }
}

function resetTeachers() {
  const ts = TeachersSheet();
  ts.reset();
}

function resetStudents() {
  const ss = StudentsSheet();
  ss.reset();
}

function fetchAllTheStudents() {
  const cs = CoursesSheet();
  const courses = cs.read();
  const ss = StudentsSheet();
  //ss.reset();
  let teachers = [];
  let first = true
  let count = 0;
  for (let course of courses) {
    if (first) {
      first = false // skip first row
    } else {
      if (!course.fetchedStudents) {
        try {
          let students = Classroom.Courses.Students.list(course.id).students
          if (students) {
            students.map((t) => ss.push({ ...t, email: t.profile.emailAddress, name: t.profile.name.fullName }))
          }
          course.fetchedStudents = true;
        } catch (err) {
          course.fetchedStudents = JSON.stringify(err);
        }

      }
    }
    SpreadsheetApp.flush();
    count += 1;
    console.log('Completed students for ', count, 'of', courses.length, course)
  }
}

function fetchAllTheCourses() {
  const cs = CoursesSheet();
  cs.reset();
  cs.fetch();
  return cs;
}

function fetchArchivedCourses() {
  const cs = ArchivedCoursesSheet();
  cs.reset();
  cs.fetch();
  return cs;
}

function StudentsSheet() {
  return JsonSheet(
    {
      headers: ['courseId', 'userId', 'email', 'name', 'profile'],
      sheetName: 'Students',
    }
  );
}

function TeachersSheet() {
  return JsonSheet(
    {
      headers: ['courseId', 'userId', 'email', 'name', 'profile'],
      sheetName: 'Teachers',
    }
  );
}


function ArchivedCoursesSheet() {
  return JsonSheet(
    {
      headers: ['id', 'updateTime', 'name', 'ownerId', 'courseState', 'enrollmentCode', 'description', 'teacherFolder', 'teacherGroupEmail', 'guardiansEnabled', 'fetchedStudents', 'fetchedTeachers'],
      sheetName: `Courses-Archived`,
      fetch: function (cs) {
        const courseArgs = { courseStates: ['Archived'] }
        var response = Classroom.Courses.list(courseArgs)
        if (response && response.courses) { cs.extend(response.courses) };
        while (response.nextPageToken) {
          console.log('Get another batch...');
          courseArgs.pageToken = response.nextPageToken;
          response = Classroom.Courses.list(courseArgs);
          if (response && response.courses) { cs.extend(response.courses); }
        }
      }
    }
  );
}

function CoursesSheet() {
  return JsonSheet(
    {
      headers: ['id', 'name', 'ownerId', 'courseState', 'enrollmentCode', 'description', 'teacherFolder', 'teacherGroupEmail', 'updateTime', 'guardiansEnabled', 'fetchedStudents', 'fetchedTeachers'],
      sheetName: `Courses`,
      fetch: function (cs) {
        const courseArgs = { courseStates: ['Active', 'Provisioned'] }
        var response = Classroom.Courses.list(courseArgs)
        if (response && response.courses) { cs.extend(response.courses) };
        while (response.nextPageToken) {
          console.log('Get another batch...');
          courseArgs.pageToken = response.nextPageToken;
          response = Classroom.Courses.list(courseArgs);
          if (response && response.courses) { cs.extend(response.courses); }
        }
      }
    }
  );
}
