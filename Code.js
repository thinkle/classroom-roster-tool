function onOpen () {
  SpreadsheetApp.getUi().createMenu(
    'Roster Tool'
    )
  .addItem('Activate','activate')
  .addItem('Update course list','fetchAllTheCourses')
  .addItem('Update archived course list','fetchArchivedCourses')
  .addItem('Update teacher list','fetchAllTheTeachers')
  .addItem('Update student list','fetchAllTheStudents')
  .addSeparator()
  .addItem('Add teachers','addTeachers')
  .addItem('Add students','addStudents')
  .addItem('Add courses','addCourses')
  .addItem('Add Support Teachers','addSupportTeachers')
  .addSeparator()
  .addItem('Remove students','removeStudents')
  .addItem('Remove teachers','removeTeachers')
  .addSeparator()
  .addItem('Update Courses','updateCourses')
  .addSeparator()
  .addItem('Get existing guardians','getAllInvites')
  .addItem('Invite guardians','generateInvites')
  .addItem('Remove Guardians','removeGuardians')
  .addToUi();
}

function activate () {
  SpreadsheetApp.getUi()
  .alert('Tool activated! Hopefully you gave me all the permissions I need! If you have any questions, reach out to Tom or use the source...');
}
