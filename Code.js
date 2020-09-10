function onOpen () {
  SpreadsheetApp.getUi().createMenu(
    'Roster Tool'
    )
  .addItem('Activate','activate')
  .addItem('Update course list','fetchAllTheCourses')
  .addItem('Update teacher list','fetchAllTheTeachers')
  .addItem('Update student list','fetchAllTheStudents')
  .addSeparator()
  .addItem('Add teachers','addTeachers')
  .addItem('Add students','addStudents')
  .addItem('Add courses','addCourses')
  .addSeparator()
  .addItem('Remove students','removeStudents')
  .addItem('Remove teachers','removeTeachers')
  .addToUi();
}

function activate () {
  SpreadsheetApp.getUi()
  .alert('Tool activated! Hopefully you gave me all the permissions I need! If you have any questions, reach out to Tom or use the source...');
}
