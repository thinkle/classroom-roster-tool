function clearArchivedCoursesForTeacher (teacher = 'classrooms@innovationcharter.org') {
  let archived = getArchivedCoursesForTeacher(teacher)
  console.log('Got me',archived.length)
  let count = 0;
  for (let c of archived) {
    console.log(c.creationTime);
    if (c.creationTime.includes('2024') || c.creationTime.includes('2025')) {
      //console.log('Course is from this year, we will leave it alone',c.creationTime,c.name);
    } else {
      Classroom.Courses.Teachers.remove(c.id,teacher);
      count++
      console.log('Removed',teacher,'from',c.name,count);
    }
  }
  
}

function clearOldCoursesForClassrooms () {
  all = getAllCoursesForTeacher()
  console.log('Wowza we got ' , all.length, 'like', all[0])
  stale = all.filter(
    (c) => !(c.creationTime.includes('2025') || c.creationTime.includes('2024'))
  )
  for (let c of stale) {
    console.log('removing classrooms@ from ',c.name);
    Classroom.Courses.Teachers.remove(c.id, 'classrooms@innovationcharter.org')
  }
  console.log('Removed classrooms@ from ',stale.length, 'out of a total of ',all.length)

}

function getAllCoursesForTeacher(teacher = 'classrooms@innovationcharter.org') {
  const courseArgs = { teacherId: teacher, pageSize: 100 };
  let allCourses = [];
  let pageToken;

  do {
    if (pageToken) courseArgs.pageToken = pageToken;
    let response = Classroom.Courses.list(courseArgs);
    if (response.courses) allCourses = allCourses.concat(response.courses);
    pageToken = response.nextPageToken;
  } while (pageToken);

  return allCourses;
}
function getArchivedCoursesForTeacher (teacher = 'classrooms@innovationcharter.org') {
  const courseArgs = {courseStates:['Archived'],teacherId:teacher}
  var response = Classroom.Courses.list(courseArgs)

  return response.courses
}
