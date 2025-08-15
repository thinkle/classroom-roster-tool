/*
 * It turns out if you auto-generate Google Classrooms, you will also generate a bunch
 * of classrooms that are never used. This script is designed to help you manage and delete
 * classrooms that have not been used.
 *
 * We will have two sheets:
 *
 * CleanupSettings
 *
 * daysOld -> Threshold of how old a course has to be to be listed
 * status -> Status of courses we want to look at (probably only ARCHIVED but depends on use case)
 *
 * We will then generate a list of courses to potentially delete
 *
 * Delete Courses
 *
 * id | name | lastUpdated | status | delete (boolean)
 */

function getCleanupSettings () {
  let sheet = JsonSheet({headers:['daysOld','status','token'], sheetName:'CleanupSettings'});
  let result = sheet.read();
  console.log('Cleanup settings: ',JSON.stringify(result[1]));
  return result[1];
}

function getListOfCoursesToCleanup () {
  let cs = CoursesToCleanupSheet();
  cs.format();
  cs.fetch();
}

function CoursesToCleanupSheet () {
  let cleanupSettings = getCleanupSettings();
  return JsonSheet(
      { headers : ['id','updateTime','ageInDays','name','description','teacherEmail','delete','deleted'],
        sheetName : `Delete Courses`,
        fetch : function (cs) {
            const courseArgs = {courseStates:cleanupSettings.status.split(/\s*[,]\*/)}
            if (cleanupSettings.token) {
              courseArgs.pageToken = cleanupSettings.token;
            }
            var response = Classroom.Courses.list(courseArgs)
            if (response && response.courses) {cs.extend(response.courses.filter(shouldCleanup).map(getMetadata))};
            while (response.nextPageToken) {
                console.log('Get another batch...');
                cleanupSettings.token = response.nextPageToken;
                courseArgs.pageToken = response.nextPageToken;
                response = Classroom.Courses.list(courseArgs);
              if (response && response.courses) {cs.extend(response.courses.filter(shouldCleanup).map(getMetadata));}
            }

            function shouldCleanup (course) {
//              let course = course; //Classroom.Courses.get('foo');
              let d = new Date(course.updateTime);
              let ageInMS = (new Date() - d);
              let ageInDays = ageInMS / 1000 / 60 / 60 / 24;
              course.ageInDays = ageInDays; // side effect
              if (ageInDays > cleanupSettings.daysOld) {
                if (isEmpty(course.id)) {
                  course.delete = true;
                  //console.log('Found one!',course);
                  return true;
                } else {
                  console.log(course.name,'not empty');
                }
              } 
            }

            function getMetadata (course) {
              // fix me
              try {
              course.teacherEmail = Classroom.Courses.Teachers.list(course.getId()).teachers[0].profile.emailAddress;
              } catch (e) {
                console.log(e,'unable to find email for course',course);
              }
              console.log('Course',course.name,'is ',course.ageInDays,'old with teacher',course.teacherEmail);
              return course;
            }

        }
      }
  );
}

function testIsEmpty () {
  console.log('Course is empty???',isEmpty('548251633809'));
  console.log('Course is empty???',isEmpty('489005427240'));
}

function isEmpty (id) {
  let materialsResponse = Classroom.Courses.CourseWorkMaterials.list(id);
  if (materialsResponse && materialsResponse.courseWorkMaterial && materialsResponse.courseWorkMaterial.length) {
    return false;
  }
  let announcementsResponse = Classroom.Courses.Announcements.list(id);
  if (announcementsResponse.announcements && announcementsResponse.announcements.length) {
    return false;
  }
  return false;
}

function deleteCourses () {
  let courseSheet = CoursesToCleanupSheet().read();
  for (let row of courseSheet) {
    if (row.delete && ! row.deleted) {
      try {
        Classroom.Courses.remove(row.id);
      } catch (e) {
        console.log('Error deleting',row.id,e);
        row.deleted = e;
        continue;
      } 
      row.deleted = true;      
    }
  }
}

