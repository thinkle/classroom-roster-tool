function MultipleAssignmentImport () {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AssignmentImport');
    let table = SHL.Table(sheet.getDataRange())
    for (let rn=1; rn<table.length; rn++) {
      let result
      if (!table[rn].Result && table[rn].courses) {
      //try {
        result = importAssignment(table[rn])
        table[rn].Result = result;
      //} catch (err) {
      //  table[rn].Result = JSON.stringify(err);
      //}
      }
    }
}

function importAssignment (
  {
    courses, title, dueDate, attachment, description,
    attachmentToCopy
  }
) {
  console.log('Got',courses, title, dueDate, attachment, description)
  dueDate = new Date(dueDate);
  console.log('Due date: ',dueDate)
  dueDate = {
    year : dueDate.getFullYear(),
    month : dueDate.getMonth()+1,
    day : dueDate.getDate()
  }
  dueTime = {
    hours : 8,
    minutes : 0,
  }
  console.log('Due date: ',dueDate)
  let resource = {
    'title': title||'Untitled Assignment',
    'description': description || '',    
    'workType': 'ASSIGNMENT',
    'state': 'PUBLISHED',
    'dueDate': dueDate,
    'dueTime' : dueTime,
  } 
  if (attachment) {
    resource.materials = [
        {'link': {'url': attachment}},       
    ]
  }
  if  (attachmentToCopy) {
    console.log('Attachment to copy!')
    let driveIdMatch = attachmentToCopy.match(/[-\w]{25,}(?!.*[-\w]{25,})/)
    if (!driveIdMatch) {
      throw new Exception(`Invalid Drive file - could not find ID in ${driveIdMatch}`);
    } 
    let driveId = driveIdMatch[0];
    let driveFile = DriveApp.getFileById(driveId);
    resource.materials = [
      {
        driveFile : {
          driveFile : {
          id : driveFile.getId(),
          title : driveFile.getName(),
          alternateLink : driveFile.getUrl(),
          thumbnailUrl : driveFile.getThumbnail(),
          },
          shareMode : 'STUDENT_COPY'
        }
      }
    ]
  }

if (typeof courses == 'string') {
  courses = courses.split(/\s*,\s*/);
} else {
  courses = [courses]
}
let results = []
courses.forEach(
  (c)=>{
    results.push(
    Classroom.Courses.CourseWork.create(
      resource,
      c
    ))
  }
);
return results;
 
}

function testDelete () {
  deleteAssignments(381781885307);
}

function undoSeniorProjectSnafu () {
  for (let id of [381971181924,
381971887367,
381970956903,
381971832526,
381971079394,
381972515202,
381971431353]) {
    console.log('Fixing ',id);
    deleteAssignments(id);
    console.log('Done with ',id);
}
}

function deleteAssignments (courseId) {
  let results = Classroom.Courses.CourseWork.list(courseId);
  for (let cw of results.courseWork) {
      Classroom.Courses.CourseWork.remove(courseId,cw.id);
  }
}

