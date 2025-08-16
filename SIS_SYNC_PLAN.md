# SIS to Google Classroom Sync Plan

## Overview

Add automated sync from Aspen SIS data.

## Current State

- ✅ SIS API authentication working
- ✅ Basic student/schedule lookup working
- ✅ Test functions in place
- ✅ SIS schools discovery (Innovation Academy HS & MS identified)
- ✅ SIS terms discovery with school-specific endpoints
- ✅ Terms ordering/filtering by school year (orderBy/sort parameters fixed)
- ✅ Current school year terms filtering (2024-2025)

## Development Notes

### Test Function Organization

- **AspenSync.gs.js**: Main test functions for development/debugging (easier to run in same window)
- **Secrets.gs.js**: Only test functions that contain sensitive data (student names, etc.)

### API Discovery Notes

- **Terms Endpoint**: Use school-specific `/schools/{id}/terms` (global `/terms` may not work)
- **Term Ordering**: `orderBy=desc&sort=schoolYear` to get most recent terms first
- **Current School Year**: Filter by `schoolYear='2024-2025'` and `status='active'` for current terms only

## Phase 1: Data Discovery & Mapping

### 1.1 Explore Available SIS Data

- ✅ Get list of schools (`/oneroster/v1p1/schools`)
- ✅ Get list of terms/academic sessions (`/oneroster/v1p1/schools/{id}/terms`)
- ✅ Get list of courses (`/oneroster/v1p1/courses`)
- ✅ Get list of classes (`/oneroster/v1p1/classes`)
- ✅ Understand the data structure and relationships
- ✅ Innovation Academy specific convenience functions

### 1.2 Map SIS Data to Classroom Needs

- [x] **Build Core API Functions First** (before spreadsheet infrastructure):

  - [x] `gatherClassroomData(classId)` - Get all data needed for Google Classroom creation
  - [x] `testGatherClassroomData()` - Test data gathering and mapping
  - [x] `createSampleClassroom()` - Test actual Google Classroom creation
  - [x] `getStudentsForClass(classId)` - Get student enrollment data
  - [x] `addStudentsToClass(classroomId, classId)` - Add students to created classroom
  - [x] Basic logging functions to track what's been created (prevent duplicates)
  - [x] `testCreateSampleClassroom()` - Test complete classroom creation
  - [x] `testGetStudentsForClass()` - Test student retrieval
  - [x] `testCompleteClassroomWorkflow()` - End-to-end test
  - [x] **Flexible API Design**:
    - [x] `createCourse(aspenId, params, converter)` - Single course creation with custom converter
    - [x] `createCourses(filter, params, converter)` - Bulk course creation with filtering
    - [x] `getSISClassesWithFilter(filter)` - Advanced filtering (subjects, terms, custom functions)
    - [x] `testCreateCourseWithConverter()` - Test custom converter functions
    - [x] `testCreateCoursesWithFilter()` - Test bulk creation with filtering
    - [x] `testCourseFiltering()` - Test filtering without creation
  - FIXED: Teacher endpoint now uses `/classes/{classId}/teachers` (was using enrollments)
  - FIXED: Student endpoint now uses `/classes/{classId}/students` (was using enrollments)

- [ ] **Then Map Requirements**:
  - [ ] Determine which courses/classes should become Google Classrooms
  - [ ] Map SIS class fields to Google Classroom properties (name, section, description, room, ownerId)
  - [ ] Design naming scheme/formulas for classroom titles
  - [ ] Identify unique identifiers for tracking sync state

### 1.3 UX Planning for Term-Based Scheduling

- [ ] **Term Scheduling Spreadsheet Design**: Create UX for managing when classes are created and students added
  - [ ] Schema: `Term | SY | id | Date to Create | Date to Add Student`
  - [ ] Allow manual override of auto-calculated dates
  - [ ] Term name/description for human readability
- [ ] **Automation Logic**: Read scheduling spreadsheet to determine when to take actions
  - [ ] Check current date against "Date to Create" to trigger class creation
  - [ ] Check current date against "Date to Add Student" to trigger enrollment
  - [ ] Handle different terms having different schedules

## Phase 2: Spreadsheet State Tracking

### 2.1 Design Tracking Spreadsheet Schema

- [ ] **Classes Sheet**: SIS Class ID, Google Classroom ID, Title, Teacher, Created Date, Last Sync
- [ ] **Students Sheet**: SIS Student ID, Student Email, Class ID, Added Date, Last Sync
- [ ] **Sync Log Sheet**: Timestamp, Action, Details, Success/Error
- [ ] **Term Schedule Sheet**: Term, SY, Term ID, Date to Create, Date to Add Student (for UX control)

### 2.2 Spreadsheet Helper Functions

- [ ] `initializeTrackingSpreadsheet()` - Create sheets with headers
- [ ] `getTrackedClasses()` - Read existing class tracking data
- [ ] `logClassCreated(sisClassId, classroomId, details)` - Record new class
- [ ] `getTrackedStudents(classId)` - Read student enrollments for a class
- [ ] `logStudentAdded(studentId, classId, details)` - Record student addition
- [ ] `logSyncAction(action, details, success)` - General logging
- [ ] `getTermSchedule()` - Read term scheduling configuration
- [ ] `updateTermSchedule(termId, createDate, addStudentDate)` - Update scheduling dates

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

**IMMEDIATE TODO:**

1. ✅ Fix orderBy/sort parameters for terms (completed)
2. ✅ Build core API functions before spreadsheet infrastructure (COMPLETED!)
3. ✅ Run `exploreInnovationClasses()` to see actual class data structure (ready to test)
4. ✅ Create `gatherClassroomData()`, `createSampleClassroom()`, `getStudentsForClass()`, `addStudentsToClass()`
5. **🚀 CURRENT FOCUS**: Test core functionality end-to-end with real data
6. After testing works: Design spreadsheet schema for tracking

**Phase 1 Completion:**

1. ✅ SIS API connectivity and authentication
2. ✅ School and term discovery
3. Next: Complete class data exploration and mapping

**UX Planning Priority:**

- Design term scheduling spreadsheet for controlling when classes are created/students added
- Plan automation logic for date-based triggers

Would you like to start with exploring the available SIS data to understand what we're working with?
