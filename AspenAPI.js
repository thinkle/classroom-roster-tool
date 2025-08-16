// ===== ASPEN SIS API CORE FUNCTIONS =====
// Core API authentication, data fetching, and caching for OneRoster v1.1

// Cache for academic sessions and terms to avoid expensive API calls
const SIS_CACHE = {
  academicSessions: new Map(),
  terms: new Map(),
  lastCacheTime: null,
  cacheTimeout: 30 * 60 * 1000, // 30 minutes
};

/**
 * OAuth 2.0 authentication with SIS API
 * @returns {string} Access token
 */
function authenticateWithSIS() {
  const clientId = getSISClientId();
  const secret = getSISSecret();
  const baseUrl = getSISUrl();

  if (!clientId || !secret || !baseUrl) {
    throw new Error(
      "SIS API configuration missing - need client ID, secret, and URL in Secrets.gs.js"
    );
  }

  // Extract base domain from the OneRoster URL for OAuth endpoint
  const baseUrlParts = baseUrl.replace(/\/+$/, "").split("/");
  const domain = baseUrlParts.slice(0, 3).join("/");
  const tokenUrl = `${domain}/oauth/rest/v2.0/auth`;

  try {
    const credentials = Utilities.base64Encode(`${clientId}:${secret}`);

    const response = UrlFetchApp.fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      payload: "grant_type=client_credentials",
    });

    if (response.getResponseCode() !== 200) {
      const errorText = response.getContentText();
      throw new Error(
        `OAuth authentication failed: ${response.getResponseCode()} - ${errorText}`
      );
    }

    const tokenData = JSON.parse(response.getContentText());
    if (!tokenData.access_token) {
      throw new Error("No access token received from SIS OAuth endpoint");
    }

    return tokenData.access_token;
  } catch (error) {
    throw new Error(`SIS authentication failed: ${error.message}`);
  }
}

/**
 * Fetch academic session details by ID with caching
 * @param {string} sessionId - Academic session sourcedId
 * @param {string} token - Auth token
 * @param {string} baseUrl - SIS API base URL
 * @returns {Object} Academic session details
 */
function getAcademicSessionDetails(sessionId, token, baseUrl) {
  // Check cache first
  if (SIS_CACHE.academicSessions.has(sessionId)) {
    return SIS_CACHE.academicSessions.get(sessionId);
  }

  try {
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const url = `${cleanBaseUrl}/academicSessions/${sessionId}`;

    const response = UrlFetchApp.fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.getResponseCode() !== 200) {
      return null;
    }

    const data = JSON.parse(response.getContentText());
    const sessionData = data.academicSession || data;

    // Cache the result
    SIS_CACHE.academicSessions.set(sessionId, sessionData);
    return sessionData;
  } catch (error) {
    console.error(
      `Error fetching academic session ${sessionId}:`,
      error.message
    );
    return null;
  }
}

/**
 * Fetch term details by ID with caching
 * @param {string} termId - Term sourcedId
 * @param {string} token - Auth token
 * @param {string} baseUrl - SIS API base URL
 * @returns {Object} Term details
 */
function getTermDetails(termId, token, baseUrl) {
  // Check cache first
  if (SIS_CACHE.terms.has(termId)) {
    return SIS_CACHE.terms.get(termId);
  }

  try {
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const url = `${cleanBaseUrl}/terms/${termId}`;

    const response = UrlFetchApp.fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.getResponseCode() !== 200) {
      return null;
    }

    const data = JSON.parse(response.getContentText());
    const termData = data.academicSession || data;

    // Cache the result
    SIS_CACHE.terms.set(termId, termData);
    return termData;
  } catch (error) {
    console.error(`Error fetching term ${termId}:`, error.message);
    return null;
  }
}

/**
 * Enhance class with academic data (school year and term details)
 * @param {Object} sisClass - SIS class data
 * @param {string} token - Auth token
 * @param {string} baseUrl - SIS API base URL
 * @returns {Object} Enhanced class data with resolved academic details
 */
function enhanceClassWithAcademicData(sisClass, token, baseUrl) {
  const enhanced = { ...sisClass };

  // Find school year reference
  let schoolYearRef = null;
  if (sisClass.schoolYear && sisClass.schoolYear.sourcedId) {
    schoolYearRef = sisClass.schoolYear;
  } else if (
    sisClass.course &&
    sisClass.course.schoolYear &&
    sisClass.course.schoolYear.sourcedId
  ) {
    schoolYearRef = sisClass.course.schoolYear;
  }

  // Enhance school year data
  if (schoolYearRef) {
    const schoolYearDetails = getAcademicSessionDetails(
      schoolYearRef.sourcedId,
      token,
      baseUrl
    );
    if (schoolYearDetails) {
      enhanced.schoolYearDetails = schoolYearDetails;
      enhanced.schoolYearTitle =
        schoolYearDetails.title || schoolYearDetails.schoolYear;
    }
  }

  // Enhance terms data
  if (sisClass.terms && Array.isArray(sisClass.terms)) {
    enhanced.termsDetails = [];
    sisClass.terms.forEach((term) => {
      if (term.sourcedId) {
        const termDetails = getTermDetails(term.sourcedId, token, baseUrl);
        if (termDetails) {
          enhanced.termsDetails.push(termDetails);
        }
      }
    });

    // Extract useful term info for naming
    enhanced.termTitles = enhanced.termsDetails
      .map((t) => t.title)
      .filter(Boolean);
    enhanced.termCodes = enhanced.termsDetails
      .map((t) => t.termCode || extractTermCode(t.title))
      .filter(Boolean);
  }

  return enhanced;
}

/**
 * Extract term code from term title (e.g., "Semester 1 2025-2026" -> "S1")
 * @param {string} termTitle - Term title
 * @returns {string} Extracted term code
 */
function extractTermCode(termTitle) {
  if (!termTitle) return "";

  const title = termTitle.toLowerCase();

  // Common patterns
  if (title.includes("semester 1") || title.includes("sem 1")) return "S1";
  if (title.includes("semester 2") || title.includes("sem 2")) return "S2";
  if (title.includes("quarter 1") || title.includes("q1")) return "Q1";
  if (title.includes("quarter 2") || title.includes("q2")) return "Q2";
  if (title.includes("quarter 3") || title.includes("q3")) return "Q3";
  if (title.includes("quarter 4") || title.includes("q4")) return "Q4";
  if (title.includes("trimester 1") || title.includes("tri 1")) return "T1";
  if (title.includes("trimester 2") || title.includes("tri 2")) return "T2";
  if (title.includes("trimester 3") || title.includes("tri 3")) return "T3";
  if (title.includes("full year") || title.includes("year")) return "FY";

  // Return first word if no pattern matches
  return termTitle.split(" ")[0].toUpperCase();
}

/**
 * Extract school year in short format (e.g., "2025-2026" -> "25-26")
 * @param {string} schoolYear - School year string
 * @returns {string} Short school year format
 */
function extractShortSchoolYear(schoolYear) {
  if (!schoolYear) return "";

  // Pattern: 2025-2026 -> 25-26
  const match = schoolYear.match(/(\d{4})-(\d{4})/);
  if (match) {
    const startYear = match[1].slice(-2);
    const endYear = match[2].slice(-2);
    return `${startYear}-${endYear}`;
  }

  // Pattern: 2025 -> 25
  const singleYearMatch = schoolYear.match(/(\d{4})/);
  if (singleYearMatch) {
    return singleYearMatch[1].slice(-2);
  }

  return schoolYear;
}

/**
 * Get list of schools from SIS
 */
function getSISSchools() {
  try {
    const token = authenticateWithSIS();
    const baseUrl = getSISUrl();
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const url = `${cleanBaseUrl}/schools?limit=100&offset=0&orderBy=asc`;

    const response = UrlFetchApp.fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.getResponseCode() !== 200) {
      const errorText = response.getContentText();
      throw new Error(
        `SIS API error getting schools: ${response.getResponseCode()} - ${errorText}`
      );
    }

    return JSON.parse(response.getContentText());
  } catch (error) {
    throw error;
  }
}

/**
 * Get classes for a specific school
 */
function getSISClassesForSchool(schoolId, limit = 50) {
  try {
    const token = authenticateWithSIS();
    const baseUrl = getSISUrl();
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const url = `${cleanBaseUrl}/schools/${schoolId}/classes?limit=${limit}&offset=0&orderBy=asc`;

    const response = UrlFetchApp.fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.getResponseCode() !== 200) {
      const errorText = response.getContentText();
      throw new Error(
        `SIS API error getting classes for school: ${response.getResponseCode()} - ${errorText}`
      );
    }

    return JSON.parse(response.getContentText());
  } catch (error) {
    throw error;
  }
}

/**
 * Get students enrolled in a SIS class
 * @param {string} classId - SIS class ID
 * @returns {Array} Array of student objects with email addresses
 */
function getStudentsForClass(classId) {
  try {
    const token = authenticateWithSIS();
    const baseUrl = getSISUrl();
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const studentsUrl = `${cleanBaseUrl}/classes/${classId}/students?limit=100&offset=0`;

    const response = UrlFetchApp.fetch(studentsUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.getResponseCode() !== 200) {
      throw new Error(
        `Failed to get class students: ${response.getResponseCode()}`
      );
    }

    const data = JSON.parse(response.getContentText());
    const students = data.users || [];

    // Filter to ensure we only have students with email addresses
    return students.filter((user) => user && user.email);
  } catch (error) {
    throw error;
  }
}

/**
 * Clear the SIS cache (useful for testing or if data becomes stale)
 */
function clearSISCache() {
  SIS_CACHE.academicSessions.clear();
  SIS_CACHE.terms.clear();
  SIS_CACHE.lastCacheTime = null;
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
      sourcedId: "SKL0000000900b",
    },
    middleSchool: {
      name: "Innovation Academy Charter Middle School",
      identifier: "MS",
      sourcedId: "SKL000000Giyaj",
    },
  };
}

/**
 * Get classes for Innovation Academy High School
 */
function getHighSchoolClasses(limit = 50) {
  const schools = getInnovationSchools();
  return getSISClassesForSchool(schools.highSchool.sourcedId, limit);
}

/**
 * Get classes for Innovation Academy Middle School
 */
function getMiddleSchoolClasses(limit = 50) {
  const schools = getInnovationSchools();
  return getSISClassesForSchool(schools.middleSchool.sourcedId, limit);
}

/**
 * Get classes for both Innovation Academy schools
 */
function getAllInnovationClasses(limit = 50) {
  try {
    const hsClasses = getHighSchoolClasses(limit);
    const msClasses = getMiddleSchoolClasses(limit);

    return {
      highSchool: {
        school: getInnovationSchools().highSchool,
        classes: hsClasses.classes || [],
        count: hsClasses.classes ? hsClasses.classes.length : 0,
      },
      middleSchool: {
        school: getInnovationSchools().middleSchool,
        classes: msClasses.classes || [],
        count: msClasses.classes ? msClasses.classes.length : 0,
      },
    };
  } catch (error) {
    throw error;
  }
}

// ===== BASIC TEST FUNCTIONS =====

/**
 * Test SIS API connectivity
 */
function testSISConnectivity() {
  try {
    const clientId = getSISClientId();
    const secret = getSISSecret();
    const url = getSISUrl();

    return {
      success: true,
      message: "SIS API endpoint configuration found",
      environment: {
        hasClientId: !!clientId,
        hasSecret: !!secret,
        hasUrl: !!url,
        urlValue: url || "not set",
      },
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Test SIS authentication
 */
function testSISAuthentication() {
  try {
    const token = authenticateWithSIS();

    return {
      success: true,
      message: "SIS authentication successful",
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + "..." : "no token",
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Simple setup test - run this first
 */
function testSISSetup() {
  console.log("=== Testing SIS API Setup ===");

  try {
    const connectResult = testSISConnectivity();
    console.log("✓ Configuration test passed");

    const authResult = testSISAuthentication();
    console.log("✓ Authentication test passed");

    console.log("=== SIS API Setup Complete ===");
    return { success: true, message: "SIS API setup completed successfully" };
  } catch (error) {
    console.error("❌ SIS API setup failed:", error.message);
    return { success: false, error: error.message };
  }
}
