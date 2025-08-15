# SIS to Google Classroom Sync Plan

## Overview

Add automated sync from Aspen SIS data.

## Current State

- ✅ SIS API authentication working
- ✅ Basic student/schedule lookup working
- ✅ Test functions in place

## Phase 1: Data Discovery & Mapping

### 1.1 Explore Available SIS Data

- [ ] Get list of schools (`/oneroster/v1p1/schools`)
- [ ] Get list of terms/academic sessions (`/oneroster/v1p1/terms`)
- [ ] Get list of courses (`/oneroster/v1p1/courses`)
- [ ] Get list of classes (`/oneroster/v1p1/classes`)
- [ ] Understand the data structure and relationships

### 1.2 Map SIS Data to Classroom Needs

- [ ] Determine which courses/classes should become Google Classrooms
- [ ] Map SIS class fields to Google Classroom properties
- [ ] Identify unique identifiers for tracking sync state

## Phase 2: Spreadsheet State Tracking

### 2.1 Design Tracking Spreadsheet Schema

- [ ] **Classes Sheet**: SIS Class ID, Google Classroom ID, Title, Teacher, Created Date, Last Sync
- [ ] **Students Sheet**: SIS Student ID, Student Email, Class ID, Added Date, Last Sync
- [ ] **Sync Log Sheet**: Timestamp, Action, Details, Success/Error

### 2.2 Spreadsheet Helper Functions

- [ ] `initializeTrackingSpreadsheet()` - Create sheets with headers
- [ ] `getTrackedClasses()` - Read existing class tracking data
- [ ] `logClassCreated(sisClassId, classroomId, details)` - Record new class
- [ ] `getTrackedStudents(classId)` - Read student enrollments for a class
- [ ] `logStudentAdded(studentId, classId, details)` - Record student addition
- [ ] `logSyncAction(action, details, success)` - General logging

## Phase 3: Class Creation from SIS

### 3.1 SIS Data Retrieval Functions

- [ ] `getSISClasses(schoolId?, termId?)` - Get classes from SIS
- [ ] `getSISClassDetails(classId)` - Get detailed class information
- [ ] `getSISTeacherForClass(classId)` - Get primary teacher for class
- [ ] `filterClassesForSync(classes)` - Apply business rules for which classes to sync

### 3.2 Google Classroom Integration

- [ ] `createGoogleClassroom(sisClass, teacher)` - Create new classroom
- [ ] `updateClassroomFromSIS(classroomId, sisClass)` - Update existing classroom
- [ ] Error handling and retry logic

### 3.3 Main Class Sync Function

- [ ] `syncClassesFromSIS()` - Main orchestration function
  - [ ] Get SIS classes
  - [ ] Filter classes to sync
  - [ ] Check against tracking spreadsheet
  - [ ] Create new classrooms as needed
  - [ ] Update tracking spreadsheet
  - [ ] Log all actions

## Phase 4: Student Enrollment from SIS

### 4.1 SIS Student Data Functions

- [ ] `getSISStudentsForClass(classId)` - Get enrolled students for a class
- [ ] `getSISTeachersForClass(classId)` - Get all teachers for a class
- [ ] `getSISStudentDetails(studentId)` - Get student information

### 4.2 Google Classroom Student Management

- [ ] `addStudentToClassroom(classroomId, studentEmail)` - Add student
- [ ] `addTeacherToClassroom(classroomId, teacherEmail)` - Add teacher
- [ ] `removeStudentFromClassroom(classroomId, studentEmail)` - Remove student
- [ ] Batch operations for efficiency

### 4.3 Main Student Sync Function

- [ ] `syncStudentsFromSIS(classId?)` - Main student sync function
  - [ ] Get current SIS enrollments
  - [ ] Get current Google Classroom enrollments
  - [ ] Calculate adds/removes needed
  - [ ] Execute enrollment changes
  - [ ] Update tracking spreadsheet
  - [ ] Log all actions

## Phase 5: Scheduling & Automation

### 5.1 Incremental Sync

- [ ] `getLastSyncTime()` - Track when last sync occurred
- [ ] `getSISChanges(since)` - Get only changed data since last sync
- [ ] `incrementalSync()` - Sync only changes, not full data

### 5.2 Scheduled Execution

- [ ] `dailySyncJob()` - Main scheduled function
- [ ] Error handling and notification
- [ ] Setup Google Apps Script trigger for daily execution

## Phase 6: Testing & Validation

### 6.1 Test Functions

- [ ] `testSISDataRetrieval()` - Validate SIS data access
- [ ] `testClassroomCreation()` - Test classroom creation with sample data
- [ ] `testStudentEnrollment()` - Test student enrollment with sample data
- [ ] `validateSyncState()` - Check spreadsheet vs actual state

### 6.2 Safety Features

- [ ] Dry-run mode for testing
- [ ] Rollback capabilities
- [ ] Data validation before sync
- [ ] Duplicate detection and prevention

## Key API Endpoints to Use

- `GET /oneroster/v1p1/schools` - List schools
- `GET /oneroster/v1p1/schools/{id}/classes` - Get classes for school
- `GET /oneroster/v1p1/schools/{schoolId}/classes/{classId}/students` - Get students for class
- `GET /oneroster/v1p1/teachers/{id}/classes` - Get classes for teacher
- `GET /oneroster/v1p1/classes/{id}` - Get class details
- `GET /oneroster/v1p1/users/{id}` - Get user details
- `GET /oneroster/v1p1/enrollments` - Get enrollment data

## Next Steps

1. Start with Phase 1.1 - exploring available SIS data
2. Create test functions to understand the data structure
3. Design the tracking spreadsheet schema
4. Build the basic sync functions

Would you like to start with exploring the available SIS data to understand what we're working with?
