/** Assumes a sheet called GuardianInvites with
 *
 * Student | Guardian | Invited | InvitationDate | state
 *
 * And a sheet called Guardians with
 *
 * student | studentId | guardianId | emailAddress | name | invitedEmailAddress
 *
 **/

function generateInvites() {
  let invites = SHL.Table(
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName("GuardianInvites")
      .getDataRange()
  );
  for (let i = 1; i < invites.length; i++) {
    let row = invites[i];
    if (!row.Invited && row.Student && row.Guardian) {
      row.Invited = "In process...";
      try {
        let result = Classroom.UserProfiles.GuardianInvitations.create(
          { invitedEmailAddress: row.Guardian },
          row.Student
        );
        row.Invited = JSON.stringify(result) || true;
        row.InvitationDate = result && result.creationTime;
        row.state = result && result.state;
      } catch (err) {
        row.Invited = JSON.stringify(err);
      }
    }
  }
}

function getInvitesForStudent(student) {
  let gs = GuardianSheet();
  let result = Classroom.UserProfiles.Guardians.list(student);
  console.log("Fetched", result, "for", student);
  result &&
    result.guardians &&
    result.guardians.map((g) =>
      gs.push({
        ...g,
        student,
        emailAddress: g.guardianProfile && g.guardianProfile.emailAddress,
        name:
          g.guardianProfile &&
          g.guardianProfile.name &&
          g.guardianProfile.name.fullName,
      })
    );
}

function getAllInvites() {
  //let students = SHL.Table(SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AspenContactInfo').getDataRange());
  let students = SHL.Table(
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName("Guardians")
      .getDataRange()
  );
  for (let i = 1; i < students.length; i++) {
    let row = students[i];
    if (row.Student && !row.fetchedGuardians) {
      try {
        getInvitesForStudent(row.Student);
        row.fetchedGuardians = true;
      } catch (err) {
        console.log("guardian fetching ERROR", err);
        row.fetchedGuardians = JSON.stringify(err);
      }
    }
    if (i % 20 == 0) {
      SpreadsheetApp.flush();
    }
  }
}

function removeGuardians() {
  let students = SHL.Table(
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName("RemoveGuardians")
      .getDataRange()
  );
  for (let i = 1; i < students.length; i++) {
    let row = students[i];
    if (!row.Removed) {
      try {
        //let result = 'Fake - not actually running!'
        let result = Classroom.UserProfiles.Guardians.remove(
          row.Student,
          row.Guardian
        );
        row.Removed = result;
        row.Status = "REMOVED";
      } catch (err) {
        row.Removed = err;
        row.Status = "ERROR";
      }
    }
  }
}

/* Dummy function to get student permissions
Classroom.Courses.Students.list();

*/
function neverRuns() {
  Classroom.Courses.Students.list("foo");
  Classroom.UserProfiles.GuardianInvitations.create("bar");
}

function GuardianSheet() {
  return JsonSheet({
    headers: [
      "student",
      "studentId",
      "guardianId",
      "emailAddress",
      "name",
      "invitedEmailAddress",
    ],
    sheetName: "Guardians",
  });
}
