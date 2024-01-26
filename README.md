# Google Apps Script Project

This is a Google Apps Script project, meant to be used as a Container-Attached Script for managing Google Classroom rosters for a school.

## About
(Note: The text below usually lives on the "README" tab of the container this script is attached to):

This is a rather powerful tool - please use with care :)		
		
Each tab is linked to a script function in the "Roster Tool" menu above.		
You'll need to click "Activate" after the menu appears to give all the necessary API permissions.		
		
| Tab              | Purpose                                      | Related menu command          |
|------------------|----------------------------------------------|-------------------------------|
| Create Courses   | Columns for creating courses                 | Add courses                   |
| Assign Teachers  | Columns for assigning teachers to courses    | Add teachers                  |
| Assign Students  | Columns for assigning students to courses    | Add students / Remove students|
| Course Info      | Full course info (name, students, teachers)  | Pulls info from course/teacher/student |
| Teachers         | Just teacher - course mappings               | Update teacher list           |
| Students         | Just student - course mappings               | Update student list           |
| Courses          | Just course info                             | Update course list            |
| Guardians        | Lists guardians currently set up in Google Classroom | Get existing guardians    |
| RemoveGuardians  | Used to remove guardians                     | Remove Guardians              |
| GuardianInvites  | Used to invite guardians                     | Invite guardians              |
