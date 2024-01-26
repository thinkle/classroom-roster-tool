function updateCourses () {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('UpdateCourses');
  let range = sheet.getDataRange();
  let dataTable = SHL.Table(range);
  for (let i=1; i<dataTable.length; i++) {
    let row = dataTable[i];
    let result
    if (row.ID && row.courseState && !row.Updated) {
      console.log('Update row',row.ID,row.courseState)
      try {
        console.log(`
        Classroom.Courses.patch(
          {courseState : ${row.courseState},
          ${row.ID},
          {fields:'id,name,courseState',updateMask:'courseState'}
        )`)
        result = Classroom.Courses.patch(
          {courseState:row.courseState},
          ""+row.ID,
          {fields:'id,name,courseState', updateMask : 'courseState'}
        )
        row.Updated = true;
      } catch (err) {
        result = err
        console.log('Error',err,'on row',row.ID,row.courseState)
      }
      row.result = JSON.stringify(result);
    }    
  }
}
