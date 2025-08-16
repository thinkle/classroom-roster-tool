# Safe Testing Approach for SIS-Google Classroom Integration

## Overview

We've implemented a two-phase approach that separates **data preparation** from **actual classroom creation**, making testing much safer during development.

## Phase 1: Parameter Generation (SAFE)

### Core Functions

1. **`getGoogleClassroomCreateParams(aspenId, params, converter)`**

   - Gets creation parameters for a single SIS class
   - **Does NOT create any classrooms**
   - Safe to run repeatedly during development

2. **`getGoogleClassroomCreateParamsMultiple(filter, params, converter)`**
   - Gets creation parameters for multiple SIS classes
   - **Does NOT create any classrooms**
   - Perfect for testing filters and converters

### Safe Testing Functions

1. **`testGetClassroomParams(filter, params, converter)`**

   - **COMPLETELY SAFE** - no classroom creation
   - Tests parameter generation with your filter and converter
   - Shows exactly what would be created without creating it

2. **`testConverterFunction(converter, limit)`**

   - **COMPLETELY SAFE** - tests converter logic only
   - Shows converter output for sample SIS data
   - Perfect for debugging custom naming schemes

3. **`testParameterGenerationWithConverter()`**
   - **COMPLETELY SAFE** - end-to-end parameter testing
   - Includes a sample converter for reference
   - Shows complete workflow without any creation

## Phase 2: Classroom Creation (ACTUAL CREATION)

### Core Functions

1. **`createCourse(aspenId, params, converter)`**

   - Creates a single Google Classroom
   - Uses `getGoogleClassroomCreateParams()` internally
   - **WARNING: Creates real classrooms**

2. **`createCourses(filter, params, converter)`**

   - Creates multiple Google Classrooms
   - Uses `getGoogleClassroomCreateParamsMultiple()` internally
   - **WARNING: Creates real classrooms**

3. **`createGoogleClassroom(classroomParams)`**
   - Low-level classroom creation from prepared parameters
   - **WARNING: Creates real classrooms**

## Enhanced Academic Data with Caching

### 🚀 **New Feature: Academic Session and Term Details**

The system now automatically fetches and caches academic session and term details, giving your converter functions access to:

- **School Year**: Full title (e.g., "2025-2026") and short format (e.g., "25-26")
- **Term Details**: Full term names (e.g., "Semester 1 2025-2026") and codes (e.g., "S1")
- **Smart Caching**: Avoids expensive duplicate API calls

### 📊 **Enhanced Class Data Available to Converters**

When your converter function receives `sisData.class`, it now includes:

```javascript
sisData.class = {
  // Original SIS data
  title: "Advanced Biology",
  classCode: "BIO101-A",
  periods: ["3"],

  // NEW: Enhanced academic data (automatically fetched and cached)
  schoolYearTitle: "2025-2026", // Full school year
  schoolYearDetails: {
    /* full session object */
  },
  termTitles: ["Semester 1 2025-2026"], // Term names
  termCodes: ["S1"], // Extracted term codes
  termsDetails: [
    /* full term objects */
  ],
};
```

### 🔧 **Updated Sample Converter**

```javascript
const academicConverter = (sisData) => {
  const cls = sisData.class;

  // Use school year in naming
  let name = cls.title;
  if (cls.schoolYearTitle) {
    const shortYear = extractShortSchoolYear(cls.schoolYearTitle); // "25-26"
    name += ` (${shortYear})`;
  }

  // Use term codes in section
  let section = `Period ${cls.periods.join(", ")}`;
  if (cls.termCodes && cls.termCodes.length > 0) {
    section += ` - ${cls.termCodes.join(", ")}`; // "Period 3 - S1"
  }

  return { name, section };
};
```

### 🧪 **New Test Function**

```javascript
// Test the caching system safely
testAcademicDataCaching();
```

This will show you:

- Which academic sessions and terms are being fetched
- How the caching works to avoid duplicate API calls
- What enhanced data is available to your converters

### ⚡ **Performance Benefits**

- **Before**: Each class would make 1-5 additional API calls for academic data
- **After**: Academic data is cached and reused across all classes
- **Result**: Massive performance improvement for bulk operations

### Step 1: Design and Test Your Converter (SAFE)

```javascript
// Define your custom converter
const myConverter = (sisData) => {
  const cls = sisData.class;
  return {
    name: `${cls.title} - ${cls.classCode}`,
    section: `Period ${cls.periods?.join(", ") || "TBD"}`,
    description: `Custom course: ${cls.title}`,
  };
};

// Test it safely
testConverterFunction(myConverter, 3);
```

### Step 2: Test Parameter Generation (SAFE)

```javascript
// Define your filter
const filter = {
  schools: ["SKL0000000900b"], // Innovation HS
  limit: 5,
};

const params = {
  courseState: "DRAFT", // Safe default
  guardiansEnabled: false,
};

// Test parameter generation - NO CREATION
const results = testGetClassroomParams(filter, params, myConverter);

// Review the results in console
console.log("Would create these classrooms:", results);
```

### Step 3: Small Scale Real Test (CAREFUL)

```javascript
// Test with just 1-2 classes first
const smallFilter = {
  schools: ["SKL0000000900b"],
  limit: 2,
};

// Creates ACTUAL classrooms - be careful!
const results = createCourses(smallFilter, params, myConverter);
```

### Step 4: Production Scale (PRODUCTION)

```javascript
// Only after testing thoroughly
const productionFilter = {
  schools: ["SKL0000000900b", "SKL000000Giyaj"], // Both schools
  schoolYear: "2024-2025",
};

const productionParams = {
  courseState: "ACTIVE",
  guardiansEnabled: true,
};

// Creates ALL matching classrooms
const results = createCourses(productionFilter, productionParams, myConverter);
```

## Example Converter Functions

### Basic Converter

```javascript
const basicConverter = (sisData) => {
  const cls = sisData.class;
  return {
    name: `${cls.title} (${cls.classCode})`,
    section: cls.periods?.join(", ") || "",
    description: `SIS ID: ${cls.sourcedId}`,
  };
};
```

### Advanced Converter with Subject Logic

```javascript
const advancedConverter = (sisData) => {
  const cls = sisData.class;
  const teacher = sisData.teacher;

  // Custom naming by subject
  let name = cls.title;
  if (cls.classCode?.includes("MATH")) {
    name = `Mathematics: ${cls.title}`;
  } else if (cls.classCode?.includes("ENG")) {
    name = `English: ${cls.title}`;
  }

  // Add teacher name if available
  if (teacher?.familyName) {
    name += ` - ${teacher.familyName}`;
  }

  return {
    name: name,
    section: `Room ${cls.location || "TBD"}`,
    description: `${cls.title}\nPeriods: ${
      cls.periods?.join(", ") || "TBD"
    }\nSIS ID: ${cls.sourcedId}`,
  };
};
```

## Safety Guidelines

✅ **SAFE to run anytime:**

- `testGetClassroomParams()`
- `testConverterFunction()`
- `testParameterGenerationWithConverter()`
- `getGoogleClassroomCreateParams()`
- `getGoogleClassroomCreateParamsMultiple()`

⚠️ **CREATES REAL CLASSROOMS:**

- `createCourse()`
- `createCourses()`
- `createGoogleClassroom()`

🚨 **Always test with small limits first!**

- Use `limit: 1-3` for initial testing
- Test with `courseState: "DRAFT"` first
- Verify your converter logic before bulk creation

## Quick Start

```javascript
// 1. SAFE: Test the provided sample converter
testParameterGenerationWithConverter();

// 2. SAFE: Test with Innovation Academy data
testGetClassroomParams({ schools: ["SKL0000000900b"], limit: 2 });

// 3. CAREFUL: Create 1 test classroom
createCourse("some_class_id", { courseState: "DRAFT" });
```
