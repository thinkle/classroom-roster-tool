function clearArchivedCoursesForTeacher (teacher = 'classrooms@innovationcharter.org') {
  let archived = getArchivedCoursesForTeacher(teacher)
  console.log('Got me',archived.length)
  for (let c of archived) {
    Classroom.Courses.Teachers.remove(c.id,teacher);
    console.log('Removed',teacher,'from',c);
  }
  
}

function getArchivedCoursesForTeacher (teacher = 'classrooms@innovationcharter.org') {
  const courseArgs = {courseStates:['Archived'],teacherId:teacher}
  var response = Classroom.Courses.list(courseArgs)

  return response.courses
}
