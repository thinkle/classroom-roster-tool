/* global logOperation, extractShortSchoolYear, fixRoom, getAllInnovationClasses, authenticateWithSIS, getSISUrl, enhanceClassWithAcademicData, getGoogleClassroomCreateParamsMultiple, createCourses, testSISSetup, getSISClassesWithFilter */
// ===== INNOVATION ACADEMY CHARTER SCHOOL SPECIFIC CODE =====
// School-specific converters, test functions, and customizations

/**
 * IACS Standard Converter - Production converter for Innovation Academy
 * Creates consistent naming and formatting for IACS Google Classrooms
 * @param {Object} sisData - SIS data object {class, course, teacher}
 * @returns {Object} Google Classroom parameters
 */
function iacsStandardConverter(sisData) {
  const cls = sisData.class;
  const course = sisData.course;

  // Build test name with clear prefix
  let name = `${course.courseCode || "Untitled"}-${cls.classCode || ""}: ${cls.title || "Untitled"}`;

  // Add school year
  if (cls.schoolYearTitle) {
    const shortYear = extractShortSchoolYear(cls.schoolYearTitle);
    if (shortYear) {
      name += ` (${shortYear})`;
    }
  }

  /* // Test description with debugging info
  let description = `TEST CLASSROOM - ${cls.title}`;
  if (course && course.courseCode) {
    description += `\nCourse Code: ${course.courseCode}`;
  }
  if (cls.schoolYearTitle) {
    description += `\nSchool Year: ${cls.schoolYearTitle}`;
  }
  if (cls.termTitles && cls.termTitles.length > 0) {
    description += `\nTerms: ${cls.termTitles.join(", ")}`;
  }
  description += `\nSIS Class ID: ${cls.sourcedId}`;
  description += `\nGenerated: ${new Date().toISOString()}`; */
  let description = `Room: ${cls.location}, Term: ${cls.termTitles ? cls.termTitles.join(", ") : "N/A"}`;
  const params = {
    name: name,
    section: `${cls.classCode}`,
    description: description,
    room: fixRoom(cls.location),
  };
  logOperation("AspenIACS", "iacsStandardConverter", `built name='${params.name}'`);
  return params;
}

/**
 * IACS Test Converter - Development converter for testing
 * Creates clearly marked test classrooms with extra info
 * @param {Object} sisData - SIS data object {class, course, teacher}
 * @returns {Object} Google Classroom parameters
 */
function iacsTestConverter(sisData) {
  const cls = sisData.class;
  const course = sisData.course;

  // Build test name with clear prefix
  let name = `[TEST] ${cls.classCode || "000"}: ${cls.title || "Untitled"}`;

  // Add school year
  if (cls.schoolYearTitle) {
    const shortYear = extractShortSchoolYear(cls.schoolYearTitle);
    if (shortYear) {
      name += ` (${shortYear})`;
    }
  }

  // Build section with periods and term info
  let section = "";
  if (cls.periods && cls.periods.length > 0) {
    section = `Period ${cls.periods.join(", ")}`;
  }

  // Add term info to section
  if (cls.termCodes && cls.termCodes.length > 0) {
    const termInfo = cls.termCodes.join(", ");
    section = section ? `${section} - ${termInfo}` : termInfo;
  }

  // Test description with debugging info
  let description = `TEST CLASSROOM - ${cls.title}`;
  if (course && course.courseCode) {
    description += `\nCourse Code: ${course.courseCode}`;
  }
  if (cls.schoolYearTitle) {
    description += `\nSchool Year: ${cls.schoolYearTitle}`;
  }
  if (cls.termTitles && cls.termTitles.length > 0) {
    description += `\nTerms: ${cls.termTitles.join(", ")}`;
  }
  description += `\nSIS Class ID: ${cls.sourcedId}`;
  description += `\nGenerated: ${new Date().toISOString()}`;

  const params = {
    name: name,
    section: section,
    description: description,
    courseState: "PROVISIONED", // Keep test classrooms as drafts
    guardiansEnabled: false, // Disable guardians for test classrooms
  };
  logOperation("AspenIACS", "iacsTestConverter", `built name='${params.name}'`);
  return params;
}

// ===== TEST FUNCTIONS =====

/**
 * Test the IACS standard converter with sample classes
 * SAFE - Does not create any classrooms, just tests converter logic
 */
function testIACSStandardConverter() {
  console.log("=== Testing IACS Standard Converter ===");
  console.log("This is SAFE - no classrooms will be created");

  try {
    // Get sample classes for testing
    const allClasses = getAllInnovationClasses(5);
    const testClasses = [
      ...allClasses.highSchool.classes.slice(0, 2),
      ...allClasses.middleSchool.classes.slice(0, 1),
    ];

    console.log(
      `\nTesting converter with ${testClasses.length} sample classes:\n`
    );

    testClasses.forEach((sisClass, index) => {
      console.log(
        `${index + 1}. ${sisClass.title} (${sisClass.classCode || "no code"})`
      );

      try {
        // Get enhanced class data
        const token = authenticateWithSIS();
        const baseUrl = getSISUrl();
        const enhanced = enhanceClassWithAcademicData(sisClass, token, baseUrl);

        // Test converter
        const sisData = {
          class: enhanced,
          course: sisClass.course || null,
          teacher: null,
        };

        const result = iacsStandardConverter(sisData);

        console.log("   Converter Result:");
        console.log(`   - Name: "${result.name}"`);
        console.log(`   - Section: "${result.section}"`);
        console.log(
          `   - Description: "${result.description.substring(0, 100)}..."`
        );
        console.log("");
      } catch (error) {
        console.error(`   Error: ${error.message}`);
      }
    });

    return { success: true, message: "Converter test completed" };
  } catch (error) {
    console.error("❌ Converter test failed:", error.message);
    throw error;
  }
}

/**
 * Test getting classroom parameters with IACS standard converter
 * SAFE - Does not create any classrooms, just prepares parameters
 */
function testGetIACSClassroomParams() {
  console.log("=== Testing IACS Classroom Parameter Generation ===");
  console.log("This is SAFE - no classrooms will be created");

  try {
    // Filter for a few High School classes
    const filter = {
      schools: ["SKL0000000900b"], // Innovation Academy High School
      limit: 3,
    };

    // Use standard production parameters
    const params = {
      courseState: "PROVISIONED", // Safe: creates in draft mode
      guardiansEnabled: false, // Safe for testing
    };

    // Get parameters using standard converter
    const results = getGoogleClassroomCreateParamsMultiple(
      filter,
      params,
      iacsStandardConverter
    );

    console.log(`\n=== RESULTS: ${results.length} classes processed ===\n`);

    results.forEach((result, index) => {
      if (result.success) {
        const params = result.classroomParams;
        console.log(
          `${index + 1}. ${result.sisClass.title} (${result.sisClass.sourcedId
          })`
        );
        console.log(`   Generated Parameters:`);
        console.log(`   - Name: "${params.name}"`);
        console.log(`   - Section: "${params.section}"`);
        console.log(`   - Room: "${params.room}"`);
        console.log(`   - Owner: ${params.ownerId}`);
        console.log(`   - State: ${params.courseState}`);
        console.log(
          `   - Description: "${params.description.substring(0, 80)}..."`
        );
        console.log("");
      } else {
        console.log(
          `${index + 1}. ERROR: ${result.sisClass.title} - ${result.error}`
        );
      }
    });

    const successCount = results.filter((r) => r.success).length;
    console.log(`\n=== SUMMARY ===`);
    console.log(
      `Successfully generated parameters for ${successCount}/${results.length} classes`
    );
    console.log(
      `To create classrooms: createCoursesIACS() or createCoursesIACSTest()`
    );

    return results;
  } catch (error) {
    console.error("❌ Parameter generation test failed:", error.message);
    throw error;
  }
}

/**
 * Create production IACS classrooms
 * WARNING: This creates actual Google Classrooms!
 * @param {Object} filter - Filter for classes to create
 * @param {Object} params - Additional parameters
 */
function createCoursesIACS(filter = {}, params = {}) {
  console.log("=== Creating IACS Production Classrooms ===");
  console.log("WARNING: This will create actual Google Classrooms!");

  // Default to High School classes if no filter specified
  if (!filter.schools && !filter.customFilter) {
    filter.schools = ["SKL0000000900b"]; // High School only by default
    filter.limit = 10; // Reasonable limit
  }

  // Production defaults
  const defaultParams = {
    courseState: "PROVISIONED", // Active state
    guardiansEnabled: true, // Enable for production
    ...params,
  };

  try {
    const results = createCourses(filter, defaultParams, iacsStandardConverter);

    console.log(`\n=== CREATION RESULTS ===`);
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log(`✅ Successfully created: ${successful.length} classrooms`);
    console.log(`❌ Failed to create: ${failed.length} classrooms`);

    successful.forEach((result) => {
      console.log(
        `✅ Created: "${result.classroom.name}" (ID: ${result.classroomId})`
      );
    });

    failed.forEach((result) => {
      console.log(`❌ Failed: ${result.sisClass.title} - ${result.error}`);
    });

    return results;
  } catch (error) {
    console.error("❌ Classroom creation failed:", error.message);
    throw error;
  }
}

/**
 * Create test IACS classrooms for development
 * WARNING: This creates actual Google Classrooms (but marked as tests)!
 * @param {number} limit - Number of test classrooms to create
 */
function createCoursesIACSTest(limit = 1) {
  console.log("=== Creating IACS Test Classrooms ===");
  console.log(
    "WARNING: This will create actual Google Classrooms (marked as tests)!"
  );

  try {
    // Filter for a few classes from both schools
    const filter = {
      limit: limit,
      customFilter: (cls) => {
        // Exclude certain types of classes for testing
        const title = cls.title ? cls.title.toLowerCase() : "";
        const excludeWords = ["lunch", "study hall", "homeroom", "advisory"];
        return !excludeWords.some((word) => title.includes(word));
      },
    };

    // Test parameters
    const params = {
      courseState: "PROVISIONED", // Keep as drafts
      guardiansEnabled: false, // No guardians for tests
    };

    const results = createCourses(filter, params, iacsTestConverter);

    console.log(`\n=== TEST CREATION RESULTS ===`);
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log(
      `✅ Successfully created: ${successful.length} test classrooms`
    );
    console.log(`❌ Failed to create: ${failed.length} classrooms`);

    successful.forEach((result) => {
      console.log(`✅ Test Classroom: "${result.classroom.name}"`);
      console.log(`   ID: ${result.classroomId}`);
      console.log(
        `   URL: https://classroom.google.com/c/${result.classroomId}`
      );
    });

    failed.forEach((result) => {
      console.log(`❌ Failed: ${result.sisClass.title} - ${result.error}`);
    });

    return results;
  } catch (error) {
    console.error("❌ Test classroom creation failed:", error.message);
    throw error;
  }
}

/**
 * Quick test to verify everything is working
 * SAFE - Only tests parameter generation
 */
function quickIACSTest() {
  console.log("=== Quick IACS Integration Test ===");
  console.log("Testing all components - SAFE, no classrooms created");

  try {
    // Test 1: Basic SIS connectivity
    console.log("\n1. Testing SIS connectivity...");
    const connectResult = testSISSetup();
    if (!connectResult.success) {
      throw new Error("SIS connectivity failed");
    }
    console.log("✅ SIS connectivity OK");

    // Test 2: Converter function
    console.log("\n2. Testing converter...");
    testIACSStandardConverter();
    console.log("✅ Converter test OK");

    // Test 3: Parameter generation
    console.log("\n3. Testing parameter generation...");
    const params = testGetIACSClassroomParams();
    const successCount = params.filter((p) => p.success).length;
    if (successCount === 0) {
      throw new Error("No classroom parameters generated successfully");
    }
    console.log(`✅ Parameter generation OK (${successCount} classes)`);

    console.log("\n=== QUICK TEST COMPLETE ===");
    console.log("✅ All systems working!");
    console.log("\nNext steps:");
    console.log("- Run createCoursesIACSTest(2) to create 2 test classrooms");
    console.log("- Run createCoursesIACS() to create production classrooms");

    return { success: true, message: "All tests passed" };
  } catch (error) {
    console.error("❌ Quick test failed:", error.message);
    throw error;
  }
}

// ===== IACS SPECIFIC UTILITY FUNCTIONS =====

/**
 * Get all PE classes for both IACS schools
 * Useful for testing bulk operations
 */
function getIACSPEClasses() {
  const filter = {
    subjects: ["PE", "Physical Education", "Wellness"],
    customFilter: (cls) => {
      const title = cls.title ? cls.title.toLowerCase() : "";
      return (
        title.includes("physical") ||
        title.includes("pe") ||
        title.includes("wellness")
      );
    },
  };

  return getSISClassesWithFilter(filter);
}

/**
 * Get all Math classes for both IACS schools
 * Useful for testing subject-specific operations
 */
function getIACSMathClasses() {
  const filter = {
    subjects: ["Math", "Mathematics"],
    customFilter: (cls) => {
      const title = cls.title ? cls.title.toLowerCase() : "";
      const mathWords = [
        "math",
        "algebra",
        "geometry",
        "calculus",
        "statistics",
      ];
      return mathWords.some((word) => title.includes(word));
    },
  };

  return getSISClassesWithFilter(filter);
}

/**
 * Test academic data caching specifically for IACS classes
 */
function testIACSAcademicData() {
  console.log("=== Testing IACS Academic Data Enhancement ===");

  try {
    // Clear cache to start fresh
    clearSISCache();

    // Get sample classes
    const allClasses = getAllInnovationClasses(3);
    const testClasses = [...allClasses.highSchool.classes.slice(0, 2)];

    console.log(
      `Testing academic data enhancement with ${testClasses.length} classes:\n`
    );

    testClasses.forEach((sisClass, index) => {
      console.log(`${index + 1}. ${sisClass.title} (${sisClass.classCode})`);

      try {
        const token = authenticateWithSIS();
        const baseUrl = getSISUrl();
        const enhanced = enhanceClassWithAcademicData(sisClass, token, baseUrl);

        console.log("   Enhanced Academic Data:");
        console.log(
          `   - School Year: ${enhanced.schoolYearTitle || "Not found"}`
        );
        console.log(
          `   - Short Year: ${enhanced.schoolYearTitle
            ? extractShortSchoolYear(enhanced.schoolYearTitle)
            : "N/A"
          }`
        );
        if (enhanced.termTitles && enhanced.termTitles.length > 0) {
          console.log(`   - Terms: ${enhanced.termTitles.join(", ")}`);
          console.log(`   - Term Codes: ${enhanced.termCodes.join(", ")}`);
        }
        console.log("");
      } catch (error) {
        console.error(`   Error: ${error.message}`);
      }
    });

    console.log(
      `Cache Status: ${SIS_CACHE.academicSessions.size} sessions, ${SIS_CACHE.terms.size} terms cached`
    );
    return { success: true, message: "Academic data test completed" };
  } catch (error) {
    console.error("❌ Academic data test failed:", error.message);
    throw error;
  }
}
