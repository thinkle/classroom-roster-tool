
function fetchAllTheStudents () {
  SpreadsheetApp.getUi().alert('NOT IMPLEMENTED YET');
}

function fetchAllTheTeachers () {
  const cs = CoursesSheet();
  const courses = cs.read();
  const ts = TeachersSheet();
  ts.reset();
  let teachers = [];
  let first = true
  for (let course of courses) {
    if (first) {
      first = false // skip first row
    } else {
      Classroom.Courses.Teachers.list(course.id).teachers.map((t)=>ts.push({...t,email:t.profile.emailAddress,name:t.profile.name.fullName}))
    }
  }
}

function fetchAllTheStudents () {
  const cs = CoursesSheet();
  const courses = cs.read();
  const ts = StudentsSheet();
  ts.reset();
  let teachers = [];
  let first = true
  for (let course of courses) {
    if (first) {
      first = false // skip first row
    } else {
      let students = Classroom.Courses.Students.list(course.id).students
      if (students) {
        students.map((t)=>ts.push({...t,email:t.profile.emailAddress,name:t.profile.name.fullName}))
      }
    }
  }
}

function fetchAllTheCourses() {
    const cs = CoursesSheet();
    cs.reset();
    cs.fetch();
    return cs;
}
function StudentsSheet () {
   return JsonSheet(
    { headers : ['courseId','userId','email','name','profile'],
     sheetName : 'Students',
    }
    );     
}

function TeachersSheet () {
  return JsonSheet(
    { headers : ['courseId','userId','email','name','profile'],
     sheetName : 'Teachers',
    }
    );     
}


function CoursesSheet () {
    return JsonSheet(
        { headers : ['id','name','ownerId','courseState','enrollmentCode','description','teacherFolder','teacherGroupEmail','updateTime','guardiansEnabled'],
          sheetName : `Courses`,
          fetch : function (cs) {
              const courseArgs = {courseStates:['Active','Provisioned']}
              var response = Classroom.Courses.list(courseArgs)
              if (response && response.courses) {cs.extend(response.courses)};
              while (response.nextPageToken) {
                  console.log('Get another batch...');
                  courseArgs.pageToken = response.nextPageToken;
                  response = Classroom.Courses.list(courseArgs);
                if (response && response.courses) {cs.extend(response.courses);}
              }
          }
        }
    );
}

function JsonSheet ({headers, sheetName, parentFolder, fetch, format}) {
    
    const ss = SpreadsheetApp.getActiveSpreadsheet(); //Cache().getSheet(sheetName,parentFolder);
    const sheet = ss.getSheetByName(sheetName); //ss.getActiveSheet();

    return {
        reset () {
            sheet.clear();
            sheet.appendRow(headers);
      return this;
        },
        read () {
            return SHL.Table(sheet.getDataRange())
        },
        format () {
            if (format) {format(sheet,ss);}
        },
        push (row) {
            sheet.appendRow(headers.map((h)=>row[h]));
        },
        extend (rows) {
            //console.log('starting with',rows);
            //console.log('headers',headers);
            const oldrows = rows;
            rows = rows.map((r)=>headers.map((h)=>r[h]));
            //console.log('mapped to...',rows)
            if (rows.length==0) {return}
            const length = rows.length;
            const lastContent = sheet.getLastRow();
            const lastRow = sheet.getMaxRows();
            if ((lastContent + length) >= lastRow) {
                // insert what we need + 1
                sheet.insertRows(lastRow,length+1)
            }
            sheet.getRange(
                lastContent + 1, 1,
                rows.length,
                rows[0].length
            ).setValues(rows);
        },
        getId () { return ss.getId()},
        getUrl () { return ss.getUrl()},
        fetch () {
            fetch(this);
            return this;
        }
    }

}