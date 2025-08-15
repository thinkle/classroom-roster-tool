function clearArchivedCoursesForTeacher (teacher = 'classrooms@innovationcharter.org') {
  let archived = getArchivedCoursesForTeacher(teacher)
  console.log('Got me',archived.length)
  let count = 0;
  for (let c of archived) {
    console.log(c.creationTime);
    if (c.creationTime.includes('2024')) {
      //console.log('Course is from this year, we will leave it alone',c.creationTime,c.name);
    } else {
      Classroom.Courses.Teachers.remove(c.id,teacher);
      count++
      console.log('Removed',teacher,'from',c.name,count);
    }
  }
  
}

function getArchivedCoursesForTeacher (teacher = 'classrooms@innovationcharter.org') {
  const courseArgs = {courseStates:['Archived'],teacherId:teacher}
  var response = Classroom.Courses.list(courseArgs)

  return response.courses
}
