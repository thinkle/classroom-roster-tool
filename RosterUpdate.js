/**
Code for updating google rosters
**/

function addTeachers () {
  let teachers = SHL.Table(SpreadsheetApp.getActiveSpreadsheet()
            .getSheetByName('Assign Teachers')
            .getDataRange());  
  let first = true
  for (let row of teachers) {
    if (first) {
      // skip header
      first = false
    }
    else {
      if (row.id && !row.Added && !row.Remove) {
        if(row['Already in class']) {
          row.Status = 'SKIPPED: ALREADY IN CLASS'
        } else if (!row.Teacher) {
          row.Status = 'SKIPPED: No teacher'
        } else {
          row.Status = 'Adding...'
          let result = Classroom.Courses.Teachers.create(
            {userId:row.Teacher},
            ""+row.id,
            );
          row.Status = JSON.stringify(result);
          row.Added = true;          
        }
          
      }
    }
  }
}

function removeStudents () {
  let students = SHL.Table(SpreadsheetApp.getActiveSpreadsheet()
            .getSheetByName('Assign Students')
            .getDataRange());  
  let first = true
  for (let row of students) {
    if (first) {
      // skip header
      first = false
    }
    else {
      if (row.id && row.Student && row.Remove && !row.Status) {
        try {
          Classroom.Courses.Students.remove(row.id+'',row.Student);
          row.Status = 'REMOVED'
          
        }
        catch (err) {
          row.Added = 'ERR'
          row.Status = JSON.stringify(err);
        }
        SpreadsheetApp.flush();
      }
    }
  }
}


function addStudents () {
   let students = SHL.Table(SpreadsheetApp.getActiveSpreadsheet()
            .getSheetByName('Assign Students')
            .getDataRange());  
  let first = true
  let count = 0;
  console.log('Looking at ',students.length,'rows of data');
  for (let row of students) {
    count += 1;
    if (first) {
      // skip header
      first = false
    }
    else {
      if (row.id && !row.Added && !row.Remove) {
        if(row['Already in class']) {
          row.Status = 'SKIPPED: ALREADY IN CLASS'
        } else if (!row.Student) {
          row.Status = 'SKIPPED: No student'
        } else {
          row.Status = 'Adding...'
          console.log('Adding ',row,count,'of',students.length);
          try {
            let result = Classroom.Courses.Students.create(
              {userId:row.Student},
              ""+row.id,
            );            
            row.Status = JSON.stringify(result);
            row.Added = true;          
          } catch (err) {
            if (err.details && err.details.message && err.details.message.indexOf('already')>-1) {
              row.Status = JSON.stringify(err.details);
              row.Added = 'Already exists';
            } else {
              row.Status = 'Error'+JSON.stringify(err)
              row.Added = 'ERR'
            }
          }
          console.log('Finished attempting/adding ',row.Student,row.id);
          SpreadsheetApp.flush();
        }
          
      }
    }
    if (count % 100 == 0) {
      console.log('On row ',count);
      SpreadsheetApp.flush();
    }
  }
}

function addCourses () {
  let courses = SHL.Table(SpreadsheetApp.getActiveSpreadsheet()
                          .getSheetByName('Create Courses')
                          .getDataRange());
  let first = true;
  for (let row of courses) {
    if (first) {first = false}
    else {
      if (row.name && !row.status) {
        let course = Classroom.Courses.create(
          {name:row.name,
           section:row.section,
           description:row.description,
           room:row.room,
           ownerId:row.ownerId,
           courseState:row.courseState,          
          }
          );
        row.id = course.id
        row.status = JSON.stringify(course);
      }
    }
  }
}
