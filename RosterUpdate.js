/**
Code for updating google rosters
**/

function getGroupMembers (groupEmail) {
  console.log('Email is',groupEmail);
  let groupSettings = AdminGroupsSettings.Groups.get(groupEmail);
  
  if (groupSettings.whoCanViewMembership != ' ALL_IN_DOMAIN_CAN_VIEW') {
    AdminGroupsSettings.Groups.patch(
      {whoCanViewMembership:'ALL_IN_DOMAIN_CAN_VIEW'},
        groupEmail
     );
  }
  console.log('Group permissions for viewing are ',groupSettings.whoCanViewMembership)
  let group = GroupsApp.getGroupByEmail(groupEmail);
  let members = group.getUsers().map((u)=>u.getEmail());
  let subGroups = group.getGroups()
  for (let sub of subGroups) {
    try {
      members = [...members, ...getGroupMembers(sub.getEmail())];
    } catch (err) {
      console.log('Error with subgroup: ',sub.getEmail());
    }
  }
  return members;
}

function testGroupMembers () {
  let result = getGroupMembers('ms-math@innovationcharter.org');
  console.log('HS English=',result);
}

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
        console.log('Handling row',row.id,row.Teacher)
        if(row['Already in class']) {
          row.Status = 'SKIPPED: ALREADY IN CLASS'
        } else if (row.Group) {
          row.Status = 'Fetching group info...';
          let teachers = getGroupMembers(row.Group);
          let results = [];
          for (let t of teachers) {
            console.log('Pushing member',t);
            let result;
            try {
              result = Classroom.Courses.Teachers.create({userId:t},""+row.id);
            } catch (err) {
              result = err;
            }
            results.push(result)
          }
          row.Status = JSON.stringify(results);
          row.Added = 'Added members';
        } else if (row.Teacher) {
          row.Status = 'Adding...'
          try {
          let result = Classroom.Courses.Teachers.create(
            {userId:row.Teacher},
            ""+row.id,
            );
          row.Status = JSON.stringify(result);
          row.Added = true;    
          } catch (err) {
            row.Status = JSON.stringify(err);
            row.Added = 'ERROR'
          }
          SpreadsheetApp.flush();
        }
          
      }
      else {
        console.log('Skipping row',row.id,row.Teacher);
      }
    }
  }
}

function removeTeachers () {
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
      if (row.id && !row.Added && row.Remove) {
        if (!row.Teacher) {
          row.Status = 'SKIPPED: No teacher'
        } else {
          row.Status = 'Removing...';
          SpreadsheetApp.flush();
          try {
            let result = Classroom.Courses.Teachers.remove(
              ""+row.id,
              row.Teacher
            );
            row.Status = JSON.stringify(result);
            row.Added = true;
          } catch (err) {
            // Check if they are the owner...
            //{"details":{"code":400,"message":"@CannotRemoveCourseOwner Course owner may not be removed."},"name":"GoogleJsonResponseException"}
            if (err.details.message.indexOf('@CannotRemoveCourseOwner'>-1)) {
              console.log('FIX ME !!!! ourse owner...')
              let teachers = Classroom.Courses.Teachers.list(row.id).teachers;
              console.log('Got me some teachers',teachers.map((t)=>JSON.stringify(t.profile.emailAddress)));
              let remainingTeachers = teachers.filter((t)=>t.profile.emailAddress != row.Teacher);
              console.log('Switch to ',remainingTeachers[0]);
              let teach = remainingTeachers[0];
              let update = new Classroom.newCourse();
              update.ownerId = teach.profile.emailAddress
              console.log('Try this update:',JSON.stringify(update));

              Classroom.Courses.patch(update, ""+row.id,{updateMask:'ownerId'} );
              Classroom.Courses.Teachers.remove(
              ""+row.id,
              row.Teacher
            );
            }
            console.log(err);
            row.Status = JSON.stringify(err);
            row.Added = 'ERROR'
          }
          SpreadsheetApp.flush();
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
      if (row.Student && row.id && !row.Added && !row.Remove && ! row.Status) {
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
        try {
        let course = Classroom.Courses.create(
          {name:row.name,
           section:row.section,
           description:row.description,
           room:row.room,
           ownerId:row.ownerId,
           courseState:row.courseState, 
           guardiansEnabled : row.guardiansEnabled || true,
          }
          );
          row.id = course.id
          row.status = JSON.stringify(course);
        } catch (err) {
          row.status = JSON.stringify(err);
        }
        SpreadsheetApp.flush();
      }
    }
  }
}

function addSupportTeachers () {
  // This one will add support staff for all classes that a student is in.
  // SupportTeacher	Student	Teacher	Courses	Added
  let supportTeachers = SHL.Table(SpreadsheetApp.getActiveSpreadsheet()
                          .getSheetByName('Assign Support Teachers')
                          .getDataRange());
   
   for (let row of supportTeachers) {
     if (!row.Added) {
        try {
          let result = addSupportTeacher({
            teacher:row.Teacher,
            student:row.Student,
            supportTeacher:row.SupportTeacher
          })
          row.Courses = JSON.stringify(result.courses)
          row.Added = JSON.stringify(result.results);
        } catch (err) {
          row.Added = err;
        }
        SpreadsheetApp.flush();
     }
   }                      
}

function getCoursesForTeacher (teacher) {
  const courseArgs = {courseStates:['Active','Provisioned','Archived'],teacherId:teacher}
  var response = Classroom.Courses.list(courseArgs)
  return response.courses
}

function getCoursesForStudent (student) {
  const courseArgs = {courseStates:['Active','Provisioned'],studentId:student}
  var response = Classroom.Courses.list(courseArgs)
  return response.courses;
}

function addSupportTeacher ({teacher,student,supportTeacher}) {
  if (!teacher && !student) {
    return {courses:[],result:'Nothing to do'};
  }
  let courses = []
  if (teacher) {
    courses = [...courses,...getCoursesForTeacher(teacher)]
    //console.log('Got courses for teacher: ',courses)
  }
  if (student) {
    courses = [...courses,...getCoursesForStudent(student)]
    //console.log('Got courses for student:',courses)
  }
  let results = []
  
  if (courses.length) {
    courses.forEach(
      (course)=>{
        try {
          Classroom.Courses.Teachers.create(
              {userId:supportTeacher},
              ""+course.id,
              );
              results.push(`Added to ${course.id}`)
        } catch (err) {
          if (err.message.indexOf('already exists')>-1) {
            results.push(`Already in ${course.id}`)
          } else {
            results.push(err);
          }
        }
      }
    )    
  }
  console.log('Done adding support ',supportTeacher,' for',teacher,student)
  console.log('Result:',{courses:courses.map((c)=>c.id),results})
  return {courses:courses.map((c)=>c.id),results}
}

function testSupportTeacher () {
  addSupportTeacher({teacher:'thinkle@innovationcharter.org',supportTeacher:'pol@innovationcharter.org'})
}
