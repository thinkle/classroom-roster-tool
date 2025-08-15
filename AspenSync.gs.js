
// ===== GOOGLE APPS SCRIPT VERSION =====

/**
 * Test the SIS API connectivity
 * Run this function to test that the SIS API is accessible
 */
function testSISConnectivity() {
  console.log("[SIS API] Testing basic connectivity...");

  try {
    const clientId = getSISClientId();
    const secret = getSISSecret();
    const url = getSISUrl();

    const result = {
      success: true,
      message: "SIS API endpoint configuration found",
      timestamp: new Date().toISOString(),
      environment: {
        hasClientId: !!clientId,
        hasSecret: !!secret,
        hasUrl: !!url,
        clientIdLength: clientId ? clientId.length : 0,
        urlValue: url || "not set",
      }
    };

    console.log("[SIS API] Connectivity test result:", result);
    return result;

  } catch (error) {
    console.error("[SIS API] Connectivity test failed:", error.message);
    throw error;
  }
}

/**
 * Test SIS authentication
 * Run this function to test OAuth authentication with the SIS API
 */
function testSISAuthentication() {
  console.log("[SIS API] Testing SIS authentication...");

  try {
    const token = authenticateWithSIS();
    console.log("[SIS API] Authentication successful, token length:", token ? token.length : 0);

    const result = {
      success: true,
      message: "SIS authentication successful",
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + "..." : "no token"
    };

    console.log("[SIS API] Authentication test result:", result);
    return result;

  } catch (error) {
    console.error("[SIS API] Authentication failed:", error.message);
    throw error;
  }
}


/**
 * Explore classes specifically for Innovation Academy schools
 * This is more focused than the full discovery and shows actual class data
 */
function runInnovationClassDiscovery() {
  console.log("Starting Innovation Academy class discovery...");
  return exploreInnovationClasses();
}

/**
 * Test the corrected terms endpoint for Innovation Academy schools
 */
function testInnovationTerms() {
  console.log("Testing terms endpoints for Innovation Academy schools...");
  try {
    const terms = getAllInnovationTerms();
    console.log("Terms discovery successful:", terms);
    return terms;
  } catch (error) {
    console.error("Terms discovery failed:", error.message);
    throw error;
  }
}

/**
 * Test getting only current school year terms for Innovation Academy
 * This should return filtered results for 2024-2025 academic year
 */
function testCurrentSchoolYearTerms() {
  console.log("Testing current school year terms for Innovation Academy...");
  try {
    const currentTerms = getCurrentInnovationTerms();
    console.log("Current school year terms:", currentTerms);

    // Log a summary
    console.log(`High School current terms: ${currentTerms.highSchool.count}`);
    console.log(`Middle School current terms: ${currentTerms.middleSchool.count}`);

    return currentTerms;
  } catch (error) {
    console.error("Current terms lookup failed:", error.message);
    throw error;
  }
}

/**
 * Test student lookup by email
 * @param {string} studentEmail - Student email to look up
 */
function testStudentLookup(studentEmail) {
  console.log("[SIS API] Testing student lookup for:", studentEmail);

  if (!studentEmail) {
    throw new Error("Student email is required for student lookup test");
  }

  try {
    const token = authenticateWithSIS();
    const baseUrl = getSISUrl();
    const student = lookupStudentByEmail(studentEmail, token, baseUrl);

    console.log("[SIS API] Student found:", student || "No student data");

    const result = {
      success: true,
      message: "Student lookup successful",
      student: student
    };

    console.log("[SIS API] Student lookup test result:", result);
    return result;

  } catch (error) {
    console.error("[SIS API] Student lookup failed:", error.message);
    throw error;
  }
}

/**
 * Test schedule lookup for a student
 * @param {string} studentEmail - Student email to look up schedule for
 */
function testScheduleLookup(studentEmail) {
  console.log("[SIS API] Testing schedule lookup for:", studentEmail);

  if (!studentEmail) {
    throw new Error("Student email is required for schedule lookup test");
  }

  try {
    const token = authenticateWithSIS();
    const baseUrl = getSISUrl();
    const student = lookupStudentByEmail(studentEmail, token, baseUrl);
    const schedule = fetchStudentClasses(student, token, baseUrl);

    console.log("[SIS API] Schedule fetched, courses:", Array.isArray(schedule) ? schedule.length : "not array");

    const result = {
      success: true,
      message: "Schedule lookup successful",
      student: student,
      schedule: schedule
    };

    console.log("[SIS API] Schedule lookup test result:", result);
    return result;

  } catch (error) {
    console.error("[SIS API] Schedule lookup failed:", error.message);
    throw error;
  }
}

/**
 * Test complete workflow: authentication, student lookup, schedule fetch, and analysis
 * @param {string} studentEmail - Student email to test with
 */
function testCompleteWorkflow(studentEmail) {
  console.log("[SIS API] Testing complete workflow for:", studentEmail);

  if (!studentEmail) {
    throw new Error("Student email is required for complete workflow test");
  }

  try {
    const token = authenticateWithSIS();
    const baseUrl = getSISUrl();
    const student = lookupStudentByEmail(studentEmail, token, baseUrl);
    const schedule = fetchStudentClasses(student, token, baseUrl);
    const analysis = analyzeStudentSchedule(student, schedule);

    const result = {
      success: true,
      message: "Complete workflow successful",
      student: student,
      schedule: schedule,
      analysis: analysis
    };

    console.log("[SIS API] Complete workflow test result:", result);
    return result;

  } catch (error) {
    console.error("[SIS API] Complete workflow failed:", error.message);
    throw error;
  }
}

/**
 * OAuth 2.0 authentication with SIS API using Google Apps Script
 * @returns {string} Access token
 */
function authenticateWithSIS() {
  const clientId = getSISClientId();
  const secret = getSISSecret();
  const baseUrl = getSISUrl();

  console.log("[SIS Auth] Starting OAuth 2.0 authentication...");
  console.log("[SIS Auth] Client ID:", clientId ? `${clientId.substring(0, 8)}...` : "missing");
  console.log("[SIS Auth] Secret:", secret ? `${secret.substring(0, 8)}...` : "missing");
  console.log("[SIS Auth] Base URL:", baseUrl || "missing");

  if (!clientId || !secret || !baseUrl) {
    throw new Error("SIS API configuration missing - need client ID, secret, and URL in Secrets.gs.js");
  }

  // OAuth 2.0 Client Credentials Flow
  // Extract base domain from the OneRoster URL for OAuth endpoint
  const baseUrlParts = baseUrl.replace(/\/+$/, "").split("/");
  const domain = baseUrlParts.slice(0, 3).join("/"); // https://domain.com
  const tokenUrl = `${domain}/oauth/rest/v2.0/auth`;

  console.log("[SIS Auth] Base URL:", baseUrl);
  console.log("[SIS Auth] Extracted domain:", domain);
  console.log("[SIS Auth] Token URL:", tokenUrl);

  try {
    // Create Basic Auth header with client credentials
    const credentials = Utilities.base64Encode(`${clientId}:${secret}`);

    console.log("[SIS Auth] Making OAuth token request...");

    const response = UrlFetchApp.fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      payload: "grant_type=client_credentials"
    });

    console.log("[SIS Auth] Token response status:", response.getResponseCode());

    if (response.getResponseCode() !== 200) {
      const errorText = response.getContentText();
      console.error("[SIS Auth] Token request failed:", errorText);
      throw new Error(`OAuth authentication failed: ${response.getResponseCode()} - ${errorText}`);
    }

    const tokenData = JSON.parse(response.getContentText());
    console.log("[SIS Auth] Token data received:", {
      hasAccessToken: !!tokenData.access_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in
    });

    if (!tokenData.access_token) {
      throw new Error("No access token received from SIS OAuth endpoint");
    }

    return tokenData.access_token;

  } catch (error) {
    console.error("[SIS Auth] Authentication error:", error);
    throw new Error(`SIS authentication failed: ${error.message}`);
  }
}

/**
 * Look up student by email using OneRoster v1.1 API
 * @param {string} email - Student email address
 * @param {string} authToken - OAuth access token
 * @param {string} baseUrl - SIS API base URL
 * @returns {Object} Student object
 */
function lookupStudentByEmail(email, authToken, baseUrl) {
  console.log("[SIS Lookup] Looking up student:", email);

  // OneRoster v1.1 endpoint for users with email filter
  const encodedEmail = encodeURIComponent(`email='${email}'`);
  const cleanBaseUrl = baseUrl.replace(/\/+$/, ""); // Remove trailing slashes
  const url = `${cleanBaseUrl}/users?limit=100&offset=0&orderBy=asc&filter=${encodedEmail}`;

  console.log("[SIS Lookup] Base URL:", baseUrl);
  console.log("[SIS Lookup] Clean base URL:", cleanBaseUrl);
  console.log("[SIS Lookup] Request URL:", url);

  try {
    const response = UrlFetchApp.fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    });

    console.log("[SIS Lookup] Response status:", response.getResponseCode());

    if (response.getResponseCode() !== 200) {
      const errorText = response.getContentText();
      console.log("[SIS Lookup] Error response:", errorText);
      throw new Error(`SIS API error looking up student: ${response.getResponseCode()} - ${errorText}`);
    }

    const data = JSON.parse(response.getContentText());
    console.log("[SIS Lookup] Response data:", JSON.stringify(data, null, 2));

    // OneRoster v1.1 response structure
    if (!data.users || data.users.length === 0) {
      throw new Error(`Student not found with email: ${email}`);
    }

    // Find student (role = 'student')
    const student = data.users.find(user => user.role === "student");
    if (!student) {
      throw new Error(`No student found with email: ${email} (found ${data.users.length} users but none with role 'student')`);
    }

    return student;

  } catch (error) {
    console.error("[SIS Lookup] Student lookup error:", error);
    throw error;
  }
}

/**
 * Fetch student's classes using OneRoster v1.1 API
 * @param {Object} student - Student object with sourcedId
 * @param {string} authToken - OAuth access token
 * @param {string} baseUrl - SIS API base URL
 * @returns {Object} Classes data
 */
function fetchStudentClasses(student, authToken, baseUrl) {
  console.log("[SIS Classes] Fetching classes for student:", (student && student.sourcedId) || "unknown");

  if (!student || !student.sourcedId) {
    throw new Error("Student sourcedId is required to fetch classes");
  }

  // OneRoster v1.1 endpoint for student's classes
  const cleanBaseUrl = baseUrl.replace(/\/+$/, ""); // Remove trailing slashes
  const url = `${cleanBaseUrl}/students/${student.sourcedId}/classes?limit=100&offset=0&orderBy=asc`;

  console.log("[SIS Classes] Base URL:", baseUrl);
  console.log("[SIS Classes] Clean base URL:", cleanBaseUrl);
  console.log("[SIS Classes] Request URL:", url);

  try {
    const response = UrlFetchApp.fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    });

    console.log("[SIS Classes] Response status:", response.getResponseCode());

    if (response.getResponseCode() !== 200) {
      const errorText = response.getContentText();
      console.log("[SIS Classes] Error response:", errorText);
      throw new Error(`SIS API error getting classes: ${response.getResponseCode()} - ${errorText}`);
    }

    const data = JSON.parse(response.getContentText());
    console.log("[SIS Classes] Response data:", JSON.stringify(data, null, 2));

    return data;

  } catch (error) {
    console.error("[SIS Classes] Classes fetch error:", error);
    throw error;
  }
}

/**
 * Analyze student schedule - placeholder for actual analysis logic
 * @param {Object} student - Student object
 * @param {Object} schedule - Schedule data
 * @returns {Object} Analysis results
 */
function analyzeStudentSchedule(student, schedule) {
  console.log("[SIS Analysis] Analyzing schedule for student:", (student && student.sourcedId) || "unknown");

  // Placeholder: Implement actual analysis logic here
  const analysis = {
    totalCredits: 0,
    classesCount: 0,
    // Add more analysis fields as needed
  };

  if (schedule && schedule.classes && Array.isArray(schedule.classes)) {
    analysis.classesCount = schedule.classes.length;
    // Calculate total credits or other metrics based on schedule data
  } else if (Array.isArray(schedule)) {
    analysis.classesCount = schedule.length;
  }

  console.log("[SIS Analysis] Schedule analysis result:", analysis);
  return analysis;
}

/**
 * Simple test function to verify the setup
 * Run this first after filling in your secrets
 */
function testSISSetup() {
  console.log("=== Testing SIS API Setup ===");

  try {
    // Test 1: Check configuration
    console.log("1. Testing configuration...");
    const result1 = testSISConnectivity();
    console.log("✓ Configuration test passed:", result1);

    // Test 2: Test authentication
    console.log("2. Testing authentication...");
    const result2 = testSISAuthentication();
    console.log("✓ Authentication test passed:", result2);

    console.log("=== SIS API Setup Complete ===");
    console.log("Next steps:");
    console.log("- Run testStudentLookup('student@example.com') with a real student email");
    console.log("- Run testScheduleLookup('student@example.com') to test schedule fetching");
    console.log("- Run testCompleteWorkflow('student@example.com') to test the full pipeline");

    return {
      success: true,
      message: "SIS API setup completed successfully",
      nextSteps: [
        "testStudentLookup('student@example.com')",
        "testScheduleLookup('student@example.com')",
        "testCompleteWorkflow('student@example.com')"
      ]
    };

  } catch (error) {
    console.error("❌ SIS API setup failed:", error.message);
    console.log("Please check:");
    console.log("1. That you've filled in the correct values in Secrets.gs.js");
    console.log("2. That your SIS API credentials are valid");
    console.log("3. That the SIS API URL is correct and accessible");

    return {
      success: false,
      error: error.message,
      troubleshooting: [
        "Check values in Secrets.gs.js",
        "Verify SIS API credentials",
        "Confirm SIS API URL is accessible"
      ]
    };
  }
}

// ===== PHASE 1: DATA DISCOVERY FUNCTIONS =====

/**
 * Get list of schools from SIS
 * Phase 1.1: Explore Available SIS Data
 */
function getSISSchools() {
  console.log("[SIS Discovery] Getting list of schools...");

  try {
    const token = authenticateWithSIS();
    const baseUrl = getSISUrl();
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const url = `${cleanBaseUrl}/schools?limit=100&offset=0&orderBy=asc`;

    console.log("[SIS Discovery] Schools URL:", url);

    const response = UrlFetchApp.fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    console.log("[SIS Discovery] Schools response status:", response.getResponseCode());

    if (response.getResponseCode() !== 200) {
      const errorText = response.getContentText();
      console.error("[SIS Discovery] Schools error response:", errorText);
      throw new Error(`SIS API error getting schools: ${response.getResponseCode()} - ${errorText}`);
    }

    const data = JSON.parse(response.getContentText());
    console.log("[SIS Discovery] Schools data:", JSON.stringify(data, null, 2));

    return data;

  } catch (error) {
    console.error("[SIS Discovery] Schools lookup error:", error);
    throw error;
  }
}

/**
 * Get list of terms/academic sessions for a specific school
 * Phase 1.1: Explore Available SIS Data
 * @param {string} schoolId - The school ID to get terms for
 * @param {string} schoolYear - Optional school year filter (e.g., "2024-2025")
 * @param {string} status - Optional status filter (e.g., "active")
 */
function getSISTermsForSchool(schoolId, schoolYear = null, status = null) {
  console.log("[SIS Discovery] Getting terms for school:", schoolId);
  if (schoolYear) console.log("[SIS Discovery] Filtering by school year:", schoolYear);
  if (status) console.log("[SIS Discovery] Filtering by status:", status);

  try {
    const token = authenticateWithSIS();
    const baseUrl = getSISUrl();
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");

    // Build filter string
    const filters = [];
    if (schoolYear) {
      filters.push(`schoolYear='${schoolYear}'`);
    }
    if (status) {
      filters.push(`status='${status}'`);
    }

    // Order by startDate descending to get most recent terms first
    let url = `${cleanBaseUrl}/schools/${schoolId}/terms?limit=100&offset=0&sort=schoolYear&orderBy=desc`;
    if (filters.length > 0) {
      const filterString = encodeURIComponent(filters.join(' AND '));
      url += `&filter=${filterString}`;
    }

    console.log("[SIS Discovery] School terms URL:", url);

    const response = UrlFetchApp.fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    console.log("[SIS Discovery] School terms response status:", response.getResponseCode());

    if (response.getResponseCode() !== 200) {
      const errorText = response.getContentText();
      console.error("[SIS Discovery] School terms error response:", errorText);
      throw new Error(`SIS API error getting terms for school: ${response.getResponseCode()} - ${errorText}`);
    }

    const data = JSON.parse(response.getContentText());
    console.log("[SIS Discovery] School terms data:", JSON.stringify(data, null, 2));

    return data;

  } catch (error) {
    console.error("[SIS Discovery] School terms lookup error:", error);
    throw error;
  }
}/**
 * Get list of terms/academic sessions from SIS (DEPRECATED - use getSISTermsForSchool)
 * Phase 1.1: Explore Available SIS Data
 */
function getSISTerms() {
  console.log("[SIS Discovery] WARNING: Global terms endpoint may not be supported");
  console.log("[SIS Discovery] Consider using getSISTermsForSchool(schoolId) instead");

  try {
    const token = authenticateWithSIS();
    const baseUrl = getSISUrl();
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const url = `${cleanBaseUrl}/terms?limit=100&offset=0&orderBy=asc`;

    console.log("[SIS Discovery] Terms URL:", url);

    const response = UrlFetchApp.fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    console.log("[SIS Discovery] Terms response status:", response.getResponseCode());

    if (response.getResponseCode() !== 200) {
      const errorText = response.getContentText();
      console.error("[SIS Discovery] Terms error response:", errorText);
      throw new Error(`SIS API error getting terms: ${response.getResponseCode()} - ${errorText}`);
    }

    const data = JSON.parse(response.getContentText());
    console.log("[SIS Discovery] Terms data:", JSON.stringify(data, null, 2));

    return data;

  } catch (error) {
    console.error("[SIS Discovery] Terms lookup error:", error);
    throw error;
  }
}/**
 * Get list of courses from SIS
 * Phase 1.1: Explore Available SIS Data
 */
function getSISCourses(limit = 50) {
  console.log("[SIS Discovery] Getting list of courses...");

  try {
    const token = authenticateWithSIS();
    const baseUrl = getSISUrl();
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const url = `${cleanBaseUrl}/courses?limit=${limit}&offset=0&orderBy=asc`;

    console.log("[SIS Discovery] Courses URL:", url);

    const response = UrlFetchApp.fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    console.log("[SIS Discovery] Courses response status:", response.getResponseCode());

    if (response.getResponseCode() !== 200) {
      const errorText = response.getContentText();
      console.error("[SIS Discovery] Courses error response:", errorText);
      throw new Error(`SIS API error getting courses: ${response.getResponseCode()} - ${errorText}`);
    }

    const data = JSON.parse(response.getContentText());
    console.log("[SIS Discovery] Courses data:", JSON.stringify(data, null, 2));

    return data;

  } catch (error) {
    console.error("[SIS Discovery] Courses lookup error:", error);
    throw error;
  }
}

/**
 * Get list of classes from SIS  
 * Phase 1.1: Explore Available SIS Data
 */
function getSISClasses(limit = 50) {
  console.log("[SIS Discovery] Getting list of classes...");

  try {
    const token = authenticateWithSIS();
    const baseUrl = getSISUrl();
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const url = `${cleanBaseUrl}/classes?limit=${limit}&offset=0&orderBy=asc`;

    console.log("[SIS Discovery] Classes URL:", url);

    const response = UrlFetchApp.fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    console.log("[SIS Discovery] Classes response status:", response.getResponseCode());

    if (response.getResponseCode() !== 200) {
      const errorText = response.getContentText();
      console.error("[SIS Discovery] Classes error response:", errorText);
      throw new Error(`SIS API error getting classes: ${response.getResponseCode()} - ${errorText}`);
    }

    const data = JSON.parse(response.getContentText());
    console.log("[SIS Discovery] Classes data:", JSON.stringify(data, null, 2));

    return data;

  } catch (error) {
    console.error("[SIS Discovery] Classes lookup error:", error);
    throw error;
  }
}

/**
 * Get classes for a specific school
 * Phase 1.1: Explore Available SIS Data
 */
function getSISClassesForSchool(schoolId, limit = 50) {
  console.log("[SIS Discovery] Getting classes for school:", schoolId);

  try {
    const token = authenticateWithSIS();
    const baseUrl = getSISUrl();
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const url = `${cleanBaseUrl}/schools/${schoolId}/classes?limit=${limit}&offset=0&orderBy=asc`;

    console.log("[SIS Discovery] School classes URL:", url);

    const response = UrlFetchApp.fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    console.log("[SIS Discovery] School classes response status:", response.getResponseCode());

    if (response.getResponseCode() !== 200) {
      const errorText = response.getContentText();
      console.error("[SIS Discovery] School classes error response:", errorText);
      throw new Error(`SIS API error getting classes for school: ${response.getResponseCode()} - ${errorText}`);
    }

    const data = JSON.parse(response.getContentText());
    console.log("[SIS Discovery] School classes data:", JSON.stringify(data, null, 2));

    return data;

  } catch (error) {
    console.error("[SIS Discovery] School classes lookup error:", error);
    throw error;
  }
}

/**
 * Comprehensive data discovery test - run this to explore your SIS data structure
 * Phase 1.1: Explore Available SIS Data
 */
function exploreSISData() {
  console.log("=== SIS DATA DISCOVERY ===");

  try {
    // Step 1: Get schools
    console.log("\n1. SCHOOLS:");
    const schools = getSISSchools();
    console.log(`Found ${schools.orgs ? schools.orgs.length : 0} schools`);

    // Step 2: Get terms for first school (since global terms endpoint may not work)
    console.log("\n2. TERMS:");
    if (schools.orgs && schools.orgs.length > 0) {
      const firstSchool = schools.orgs[0];
      console.log(`Getting terms for school: ${firstSchool.name}`);
      try {
        const terms = getSISTermsForSchool(firstSchool.sourcedId);
        console.log(`Found ${terms.academicSessions ? terms.academicSessions.length : 0} terms for this school`);
      } catch (error) {
        console.log("Terms lookup failed for this school:", error.message);
      }
    } else {
      console.log("No schools available to get terms for");
    }

    // Step 3: Get courses (limited sample)
    console.log("\n3. COURSES (sample):");
    const courses = getSISCourses(10);
    console.log(`Found ${courses.courses ? courses.courses.length : 0} courses in sample`);

    // Step 4: Get classes (limited sample)
    console.log("\n4. CLASSES (sample):");
    const classes = getSISClasses(10);
    console.log(`Found ${classes.classes ? classes.classes.length : 0} classes in sample`);

    // Step 5: If we have schools, get classes for the first school
    if (schools.orgs && schools.orgs.length > 0) {
      const firstSchool = schools.orgs[0];
      console.log(`\n5. CLASSES FOR SCHOOL "${firstSchool.name}" (${firstSchool.sourcedId}):`);
      const schoolClasses = getSISClassesForSchool(firstSchool.sourcedId, 10);
      console.log(`Found ${schoolClasses.classes ? schoolClasses.classes.length : 0} classes for this school`);
    }

    console.log("\n=== DATA DISCOVERY COMPLETE ===");
    console.log("Next steps:");
    console.log("1. Review the logged data structure");
    console.log("2. Identify which school(s) you want to sync");
    console.log("3. Identify which classes should become Google Classrooms");
    console.log("4. Design the tracking spreadsheet schema");

    return {
      success: true,
      message: "SIS data discovery completed successfully",
      summary: {
        schools: schools.orgs ? schools.orgs.length : 0,
        courses: courses.courses ? courses.courses.length : 0,
        classes: classes.classes ? classes.classes.length : 0
      }
    };

  } catch (error) {
    console.error("❌ SIS data discovery failed:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ===== CONVENIENCE FUNCTIONS FOR INNOVATION ACADEMY =====

/**
 * Get school information for Innovation Academy schools
 */
function getInnovationSchools() {
  return {
    highSchool: {
      name: "Innovation Academy Charter High School",
      identifier: "HS",
      sourcedId: "SKL0000000900b"
    },
    middleSchool: {
      name: "Innovation Academy Charter Middle School",
      identifier: "MS",
      sourcedId: "SKL000000Giyaj"
    }
  };
}

/**
 * Log all Innovation Academy school information
 */
function logInnovationSchools() {
  const schools = getInnovationSchools();
  console.log("=== INNOVATION ACADEMY SCHOOLS ===");
  console.log("High School:", schools.highSchool);
  console.log("Middle School:", schools.middleSchool);
  return schools;
}

/**
 * Get classes for Innovation Academy High School
 */
function getHighSchoolClasses(limit = 50) {
  console.log("[Innovation] Getting High School classes...");
  const schools = getInnovationSchools();
  return getSISClassesForSchool(schools.highSchool.sourcedId, limit);
}

/**
 * Get classes for Innovation Academy Middle School
 */
function getMiddleSchoolClasses(limit = 50) {
  console.log("[Innovation] Getting Middle School classes...");
  const schools = getInnovationSchools();
  return getSISClassesForSchool(schools.middleSchool.sourcedId, limit);
}

/**
 * Get classes for both Innovation Academy schools
 */
function getAllInnovationClasses(limit = 50) {
  console.log("[Innovation] Getting classes for both schools...");

  try {
    const hsClasses = getHighSchoolClasses(limit);
    const msClasses = getMiddleSchoolClasses(limit);

    const result = {
      highSchool: {
        school: getInnovationSchools().highSchool,
        classes: hsClasses.classes || [],
        count: hsClasses.classes ? hsClasses.classes.length : 0
      },
      middleSchool: {
        school: getInnovationSchools().middleSchool,
        classes: msClasses.classes || [],
        count: msClasses.classes ? msClasses.classes.length : 0
      }
    };

    console.log(`[Innovation] Found ${result.highSchool.count} HS classes and ${result.middleSchool.count} MS classes`);
    return result;

  } catch (error) {
    console.error("[Innovation] Error getting classes:", error);
    throw error;
  }
}

/**
 * Get terms for Innovation Academy High School
 */
function getHighSchoolTerms() {
  console.log("[Innovation] Getting High School terms...");
  const schools = getInnovationSchools();
  return getSISTermsForSchool(schools.highSchool.sourcedId);
}

/**
 * Get terms for Innovation Academy Middle School
 */
function getMiddleSchoolTerms() {
  console.log("[Innovation] Getting Middle School terms...");
  const schools = getInnovationSchools();
  return getSISTermsForSchool(schools.middleSchool.sourcedId);
}

/**
 * Get terms for both Innovation Academy schools
 */
/**
 * Get current school year terms for Innovation Academy schools
 * This returns only terms for the current academic year (2024-2025)
 */
function getCurrentInnovationTerms() {
  console.log("[Innovation] Getting current school year terms for both schools...");

  try {
    // Get current school year - you might want to make this dynamic
    const currentSchoolYear = "2024-2025";

    const schools = getInnovationSchools();
    const hsTerms = getSISTermsForSchool(schools.highSchool.sourcedId, currentSchoolYear, "active");
    const msTerms = getSISTermsForSchool(schools.middleSchool.sourcedId, currentSchoolYear, "active");

    const result = {
      schoolYear: currentSchoolYear,
      highSchool: {
        school: schools.highSchool,
        terms: hsTerms.academicSessions || [],
        count: hsTerms.academicSessions ? hsTerms.academicSessions.length : 0
      },
      middleSchool: {
        school: schools.middleSchool,
        terms: msTerms.academicSessions || [],
        count: msTerms.academicSessions ? msTerms.academicSessions.length : 0
      }
    };

    console.log(`[Innovation] Found ${result.highSchool.count} current HS terms and ${result.middleSchool.count} current MS terms`);
    return result;

  } catch (error) {
    console.error("[Innovation] Error getting current terms:", error);
    throw error;
  }
}

function getAllInnovationTerms() {
  console.log("[Innovation] Getting terms for both schools...");

  try {
    const hsTerms = getHighSchoolTerms();
    const msTerms = getMiddleSchoolTerms();

    const result = {
      highSchool: {
        school: getInnovationSchools().highSchool,
        terms: hsTerms.academicSessions || [],
        count: hsTerms.academicSessions ? hsTerms.academicSessions.length : 0
      },
      middleSchool: {
        school: getInnovationSchools().middleSchool,
        terms: msTerms.academicSessions || [],
        count: msTerms.academicSessions ? msTerms.academicSessions.length : 0
      }
    };

    console.log(`[Innovation] Found ${result.highSchool.count} HS terms and ${result.middleSchool.count} MS terms`);
    return result;

  } catch (error) {
    console.error("[Innovation] Error getting terms:", error);
    throw error;
  }
}

/**
 * Explore classes for Innovation Academy - focused discovery
 */
function exploreInnovationClasses() {
  console.log("=== INNOVATION ACADEMY CLASS DISCOVERY ===");

  try {
    const schools = logInnovationSchools();
    console.log("\nGetting classes for both schools...");

    const allClasses = getAllInnovationClasses(20); // Limit to 20 per school for initial exploration

    console.log("\n=== HIGH SCHOOL CLASSES ===");
    if (allClasses.highSchool.classes.length > 0) {
      allClasses.highSchool.classes.forEach((cls, index) => {
        console.log(`${index + 1}. ${cls.title} (${cls.classCode}) - ${cls.sourcedId}`);
        if (cls.course) console.log(`   Course: ${cls.course.sourcedId}`);
        if (cls.periods) console.log(`   Periods: ${cls.periods.join(', ')}`);
      });
    } else {
      console.log("No classes found for High School");
    }

    console.log("\n=== MIDDLE SCHOOL CLASSES ===");
    if (allClasses.middleSchool.classes.length > 0) {
      allClasses.middleSchool.classes.forEach((cls, index) => {
        console.log(`${index + 1}. ${cls.title} (${cls.classCode}) - ${cls.sourcedId}`);
        if (cls.course) console.log(`   Course: ${cls.course.sourcedId}`);
        if (cls.periods) console.log(`   Periods: ${cls.periods.join(', ')}`);
      });
    } else {
      console.log("No classes found for Middle School");
    }

    console.log("\n=== SUMMARY ===");
    console.log(`Total High School classes: ${allClasses.highSchool.count}`);
    console.log(`Total Middle School classes: ${allClasses.middleSchool.count}`);
    console.log(`Total classes: ${allClasses.highSchool.count + allClasses.middleSchool.count}`);

    return allClasses;

  } catch (error) {
    console.error("❌ Innovation class discovery failed:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}


// SIS API Integration for Google Apps Script
// Converted from AWS Lambda to Google Apps Script

/*
ORIGINAL AWS LAMBDA CODE (for reference):
// Test new Aspen sync method.

// Simple step-by-step SIS API testing endpoint
import type { APIGatewayEvent, Context } from "aws-lambda";
declare var process: any;

export async function handler(event: APIGatewayEvent, context: Context) {
  console.log(
    "[SIS API] Request received:",
    event.httpMethod,
    event.queryStringParameters
  );

  if (event.httpMethod !== "GET") {
    console.log("[SIS API] Method not allowed:", event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const { testStep, studentEmail } = event.queryStringParameters || {};
  console.log("[SIS API] Test step:", testStep, "Student email:", studentEmail);

  try {
    // Step A: Basic connectivity test
    if (testStep === "connect") {
      console.log("[SIS API] Testing basic connectivity...");
      const clientId = process.env.SIS_CLIENT_IDENTIFIER;
      const secret = process.env.SIS_SECRET;
      const url = process.env.SIS_URL;

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: "SIS API endpoint is reachable",
          timestamp: new Date().toISOString(),
          environment: {
            hasClientId: !!clientId,
            hasSecret: !!secret,
            hasUrl: !!url,
            clientIdLength: clientId?.length || 0,
            urlValue: url || "not set",
          },
        }),
      };
    }

    // Step B: Test SIS authentication
    if (testStep === "auth") {
      console.log("[SIS API] Testing SIS authentication...");
      try {
        const token = await authenticateWithSIS();
        console.log(
          "[SIS API] Authentication successful, token length:",
          token?.length || 0
        );
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: "SIS authentication successful",
            hasToken: !!token,
            tokenPreview: token ? token.substring(0, 20) + "..." : "no token",
          }),
        };
      } catch (authError: any) {
        console.error("[SIS API] Authentication failed:", authError.message);
        return {
          statusCode: 401,
          body: JSON.stringify({
            error: "SIS authentication failed",
            details: authError.message,
          }),
        };
      }
    }

    // Step C: Test student lookup by email
    if (testStep === "student" && studentEmail) {
      console.log("[SIS API] Testing student lookup for:", studentEmail);
      try {
        const token = await authenticateWithSIS();
        const baseUrl = process.env.SIS_URL || "";
        const student = await lookupStudentByEmail(
          studentEmail,
          token,
          baseUrl
        );
        console.log("[SIS API] Student found:", student || "No student data");
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: "Student lookup successful",
            student: student,
          }),
        };
      } catch (lookupError: any) {
        console.error("[SIS API] Student lookup failed:", lookupError.message);
        return {
          statusCode: 404,
          body: JSON.stringify({
            error: "Student lookup failed",
            details: lookupError.message,
          }),
        };
      }
    }

    // Step D: Test schedule lookup
    if (testStep === "schedule" && studentEmail) {
      console.log("[SIS API] Testing schedule lookup for:", studentEmail);
      try {
        const token = await authenticateWithSIS();
        const baseUrl = process.env.SIS_URL || "";
        const student = await lookupStudentByEmail(
          studentEmail,
          token,
          baseUrl
        );
        const schedule = await fetchStudentClasses(student, token, baseUrl);
        console.log(
          "[SIS API] Schedule fetched, courses:",
          Array.isArray(schedule) ? schedule.length : "not array"
        );
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: "Schedule lookup successful",
            student: student,
            schedule: schedule,
          }),
        };
      } catch (scheduleError: any) {
        console.error(
          "[SIS API] Schedule lookup failed:",
          scheduleError.message
        );
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: "Schedule lookup failed",
            details: scheduleError.message,
          }),
        };
      }
    }

    // Step E: Test schedule analysis with bell schedules
    if (testStep === "analysis" && studentEmail) {
      console.log("[SIS API] Testing schedule analysis for:", studentEmail);
      try {
        const token = await authenticateWithSIS();
        const baseUrl = process.env.SIS_URL || "";
        const student = await lookupStudentByEmail(
          studentEmail,
          token,
          baseUrl
        );
        const schedule = await fetchStudentClasses(student, token, baseUrl); // Perform schedule analysis
        const analysis = analyzeStudentSchedule(student, schedule);

        console.log("[SIS API] Schedule analysis completed:", analysis);
        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: "Schedule analysis successful",
            student: student,
            schedule: schedule,
            analysis: analysis,
          }),
        };
      } catch (analysisError: any) {
        console.error(
          "[SIS API] Schedule analysis failed:",
          analysisError.message
        );
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: "Schedule analysis failed",
            details: analysisError.message,
          }),
        };
      }
    }

    // Default usage info
    console.log("[SIS API] Missing required parameters");
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing required parameters",
        usage:
          "Use testStep=connect|auth|student|schedule|analysis and studentEmail for student/schedule tests",
      }),
    };
  } catch (error: any) {
    console.error("[SIS API] Unexpected error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Internal server error",
        details: error.stack,
      }),
    };
  }
}

// Simple authentication function - OAuth 2.0 client credentials flow
async function authenticateWithSIS(): Promise<string> {
  const clientId = process.env.SIS_CLIENT_IDENTIFIER;
  const secret = process.env.SIS_SECRET;
  const baseUrl = process.env.SIS_URL;

  console.log("[SIS Auth] Starting OAuth 2.0 authentication...");
  console.log(
    "[SIS Auth] Client ID:",
    clientId ? `${clientId.substring(0, 8)}...` : "missing"
  );
  console.log(
    "[SIS Auth] Secret:",
    secret ? `${secret.substring(0, 8)}...` : "missing"
  );
  console.log("[SIS Auth] Base URL:", baseUrl || "missing");

  if (!clientId || !secret || !baseUrl) {
    throw new Error(
      "SIS API configuration missing - need SIS_CLIENT_IDENTIFIER, SIS_SECRET, and SIS_URL environment variables"
    );
  }

  // OAuth 2.0 Client Credentials Flow
  // Extract base domain from the OneRoster URL for OAuth endpoint
  const baseUrlParts = baseUrl.replace(/\/+$/, "").split("/");
  const domain = baseUrlParts.slice(0, 3).join("/"); // https://domain.com
  const tokenUrl = `${domain}/oauth/rest/v2.0/auth`;
  console.log("[SIS Auth] Base URL:", baseUrl);
  console.log("[SIS Auth] Extracted domain:", domain);
  console.log("[SIS Auth] Token URL:", tokenUrl);

  try {
    // Create Basic Auth header with client credentials (base64 encode manually)
    const credentials = btoa(`${clientId}:${secret}`);

    console.log("[SIS Auth] Making OAuth token request...");
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: "grant_type=client_credentials",
    });

    console.log("[SIS Auth] Token response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[SIS Auth] Token request failed:", errorText);
      throw new Error(
        `OAuth authentication failed: ${response.status} - ${errorText}`
      );
    }

    const tokenData = await response.json();
    console.log("[SIS Auth] Token data received:", {
      hasAccessToken: !!tokenData.access_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in,
    });

    if (!tokenData.access_token) {
      throw new Error("No access token received from SIS OAuth endpoint");
    }

    return tokenData.access_token;
  } catch (error: any) {
    console.error("[SIS Auth] Authentication error:", error);
    throw new Error(`SIS authentication failed: ${error.message}`);
  }
}

// Simple student lookup function - OneRoster v1.1 compliant
async function lookupStudentByEmail(
  email: string,
  authToken: string,
  baseUrl: string
): Promise<any> {
  console.log("[SIS Lookup] Looking up student:", email);

  // OneRoster v1.1 endpoint for users with email filter
  const encodedEmail = encodeURIComponent(`email='${email}'`);
  // baseUrl already includes /ims/oneroster/v1p1/, so just append the endpoint
  const cleanBaseUrl = baseUrl.replace(/\/+$/, ""); // Remove trailing slashes
  const url = `${cleanBaseUrl}/users?limit=100&offset=0&orderBy=asc&filter=${encodedEmail}`;
  console.log("[SIS Lookup] Base URL:", baseUrl);
  console.log("[SIS Lookup] Clean base URL:", cleanBaseUrl);
  console.log("[SIS Lookup] Request URL:", url);

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  console.log("[SIS Lookup] Response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.log("[SIS Lookup] Error response:", errorText);
    throw new Error(
      `SIS API error looking up student: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();
  console.log("[SIS Lookup] Response data:", JSON.stringify(data, null, 2));

  // OneRoster v1.1 response structure
  if (!data.users || data.users.length === 0) {
    throw new Error(`Student not found with email: ${email}`);
  }

  // Find student (role = 'student')
  const student = data.users.find((user: any) => user.role === "student");
  if (!student) {
    throw new Error(
      `No student found with email: ${email} (found ${data.users.length} users but none with role 'student')`
    );
  }

  return student;
}

// Simple schedule fetch function - OneRoster v1.1 compliant
async function fetchStudentClasses(
  student: any,
  authToken: string,
  baseUrl: string
): Promise<any> {
  console.log(
    "[SIS Classes] Fetching classes for student:",
    student?.sourcedId || "unknown"
  );

  if (!student?.sourcedId) {
    throw new Error("Student sourcedId is required to fetch classes");
  }

  // OneRoster v1.1 endpoint for student's classes
  const cleanBaseUrl = baseUrl.replace(/\/+$/, ""); // Remove trailing slashes
  const url = `${cleanBaseUrl}/students/${student.sourcedId}/classes?limit=100&offset=0&orderBy=asc`;
  console.log("[SIS Classes] Base URL:", baseUrl);
  console.log("[SIS Classes] Clean base URL:", cleanBaseUrl);
  console.log("[SIS Classes] Request URL:", url);

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  console.log("[SIS Classes] Response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.log("[SIS Classes] Error response:", errorText);
    throw new Error(
      `SIS API error getting classes: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();
  console.log("[SIS Classes] Response data:", JSON.stringify(data, null, 2));

  return data;
}

// Simple schedule analysis function - placeholder for actual analysis logic
function analyzeStudentSchedule(student: any, schedule: any): any {
  console.log(
    "[SIS Analysis] Analyzing schedule for student:",
    student?.sourcedId || "unknown"
  );

  // Placeholder: Implement actual analysis logic here
  const analysis = {
    totalCredits: 0,
    classesCount: 0,
    // Add more analysis fields as needed
  };

  if (Array.isArray(schedule)) {
    analysis.classesCount = schedule.length;
    // Calculate total credits or other metrics based on schedule data
  }

  console.log("[SIS Analysis] Schedule analysis result:", analysis);
  return analysis;
}
*/
