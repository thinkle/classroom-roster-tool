/*
ARCHIVED FILE: AspenSync.gs.js (Original 3000-line monolithic implementation)

This file has been archived for safety and reference purposes.
The functionality has been reorganized into three focused files:
- AspenAPI.gs: Core SIS API functions (authentication, caching, data fetching)
- AspenClassroomConnector.gs: Main generator functions (flexible API for classroom creation)  
- AspenIACS.gs: School-specific converters and test functions

This archived file is commented out to prevent function name conflicts
while preserving the original implementation for reference.

Date archived: August 15, 2025
*/

// 
// /*
// ===== ARCHIVED: ORIGINAL AspenSync.gs.js FILE =====
// This file has been reorganized into three separate files:
// - AspenAPI.gs (Core SIS API functions)
// - AspenClassroomConnector.gs (Main generator functions)
// - AspenIACS.gs (School-specific converters and tests)
// 
// Preserved here as backup before deletion.
// ===============================================
// 
// // ===== GOOGLE APPS SCRIPT VERSION =====
// 
// /**
//  * Test the SIS API connectivity
//  * Run this function to test that the SIS API is accessible
//  */
// function testSISConnectivity() {
//   console.log("[SIS API] Testing basic connectivity...");
// 
//   try {
//     const clientId = getSISClientId();
//     const secret = getSISSecret();
//     const url = getSISUrl();
// 
//     const result = {
//       success: true,
//       message: "SIS API endpoint configuration found",
//       timestamp: new Date().toISOString(),
//       environment: {
//         hasClientId: !!clientId,
//         hasSecret: !!secret,
//         hasUrl: !!url,
//         clientIdLength: clientId ? clientId.length : 0,
//         urlValue: url || "not set",
//       }
//     };
// 
//     console.log("[SIS API] Connectivity test result:", result);
//     return result;
// 
//   } catch (error) {
//     console.error("[SIS API] Connectivity test failed:", error.message);
//     throw error;
//   }
// }
// 
// /**
//  * Test SIS authentication
//  * Run this function to test OAuth authentication with the SIS API
//  */
// function testSISAuthentication() {
//   console.log("[SIS API] Testing SIS authentication...");
// 
//   try {
//     const token = authenticateWithSIS();
//     console.log("[SIS API] Authentication successful, token length:", token ? token.length : 0);
// 
//     const result = {
//       success: true,
//       message: "SIS authentication successful",
//       hasToken: !!token,
//       tokenPreview: token ? token.substring(0, 20) + "..." : "no token"
//     };
// 
//     console.log("[SIS API] Authentication test result:", result);
//     return result;
// 
//   } catch (error) {
//     console.error("[SIS API] Authentication failed:", error.message);
//     throw error;
//   }
// }
// 
// 
// /**
//  * Explore classes specifically for Innovation Academy schools
//  * This is more focused than the full discovery and shows actual class data
//  */
// function runInnovationClassDiscovery() {
//   console.log("Starting Innovation Academy class discovery...");
//   return exploreInnovationClasses();
// }
// 
// /**
//  * Test the corrected terms endpoint for Innovation Academy schools
//  */
// function testInnovationTerms() {
//   console.log("Testing terms endpoints for Innovation Academy schools...");
//   try {
//     const terms = getAllInnovationTerms();
//     console.log("Terms discovery successful:", terms);
//     return terms;
//   } catch (error) {
//     console.error("Terms discovery failed:", error.message);
//     throw error;
//   }
// }
// 
// /**
//  * Test getting only current school year terms for Innovation Academy
//  * This should return filtered results for 2024-2025 academic year
//  */
// function testCurrentSchoolYearTerms() {
//   console.log("Testing current school year terms for Innovation Academy...");
//   try {
//     const currentTerms = getCurrentInnovationTerms();
//     console.log("Current school year terms:", currentTerms);
// 
//     // Log a summary
//     console.log(`High School current terms: ${currentTerms.highSchool.count}`);
//     console.log(`Middle School current terms: ${currentTerms.middleSchool.count}`);
// 
//     return currentTerms;
//   } catch (error) {
//     console.error("Current terms lookup failed:", error.message);
//     throw error;
//   }
// }
// 
// /**
//  * Test student lookup by email
//  * @param {string} studentEmail - Student email to look up
//  */
// function testStudentLookup(studentEmail) {
//   console.log("[SIS API] Testing student lookup for:", studentEmail);
// 
//   if (!studentEmail) {
//     throw new Error("Student email is required for student lookup test");
//   }
// 
//   try {
//     const token = authenticateWithSIS();
//     const baseUrl = getSISUrl();
//     const student = lookupStudentByEmail(studentEmail, token, baseUrl);
// 
//     console.log("[SIS API] Student found:", student || "No student data");
// 
//     const result = {
//       success: true,
//       message: "Student lookup successful",
//       student: student
//     };
// 
//     console.log("[SIS API] Student lookup test result:", result);
//     return result;
// 
//   } catch (error) {
//     console.error("[SIS API] Student lookup failed:", error.message);
//     throw error;
//   }
// }
// 
// /**
//  * Test schedule lookup for a student
//  * @param {string} studentEmail - Student email to look up schedule for
//  */
// function testScheduleLookup(studentEmail) {
//   console.log("[SIS API] Testing schedule lookup for:", studentEmail);
// 
//   if (!studentEmail) {
//     throw new Error("Student email is required for schedule lookup test");
//   }
// 
//   try {
//     const token = authenticateWithSIS();
//     const baseUrl = getSISUrl();
//     const student = lookupStudentByEmail(studentEmail, token, baseUrl);
//     const schedule = fetchStudentClasses(student, token, baseUrl);
// 
//     console.log("[SIS API] Schedule fetched, courses:", Array.isArray(schedule) ? schedule.length : "not array");
// 
//     const result = {
//       success: true,
//       message: "Schedule lookup successful",
//       student: student,
//       schedule: schedule
//     };
// 
//     console.log("[SIS API] Schedule lookup test result:", result);
//     return result;
// 
//   } catch (error) {
//     console.error("[SIS API] Schedule lookup failed:", error.message);
//     throw error;
//   }
// }
// 
// /**
//  * Test complete workflow: authentication, student lookup, schedule fetch, and analysis
//  * @param {string} studentEmail - Student email to test with
//  */
// function testCompleteWorkflow(studentEmail) {
//   console.log("[SIS API] Testing complete workflow for:", studentEmail);
// 
//   if (!studentEmail) {
//     throw new Error("Student email is required for complete workflow test");
//   }
// 
//   try {
//     const token = authenticateWithSIS();
//     const baseUrl = getSISUrl();
//     const student = lookupStudentByEmail(studentEmail, token, baseUrl);
//     const schedule = fetchStudentClasses(student, token, baseUrl);
//     const analysis = analyzeStudentSchedule(student, schedule);
// 
//     const result = {
//       success: true,
//       message: "Complete workflow successful",
//       student: student,
//       schedule: schedule,
//       analysis: analysis
//     };
// 
//     console.log("[SIS API] Complete workflow test result:", result);
//     return result;
// 
//   } catch (error) {
//     console.error("[SIS API] Complete workflow failed:", error.message);
//     throw error;
//   }
// }
// 
// /**
//  * OAuth 2.0 authentication with SIS API using Google Apps Script
//  * @returns {string} Access token
//  */
// function authenticateWithSIS() {
//   const clientId = getSISClientId();
//   const secret = getSISSecret();
//   const baseUrl = getSISUrl();
// 
//   console.log("[SIS Auth] Starting OAuth 2.0 authentication...");
//   console.log("[SIS Auth] Client ID:", clientId ? `${clientId.substring(0, 8)}...` : "missing");
//   console.log("[SIS Auth] Secret:", secret ? `${secret.substring(0, 8)}...` : "missing");
//   console.log("[SIS Auth] Base URL:", baseUrl || "missing");
// 
//   if (!clientId || !secret || !baseUrl) {
//     throw new Error("SIS API configuration missing - need client ID, secret, and URL in Secrets.gs.js");
//   }
// 
//   // OAuth 2.0 Client Credentials Flow
//   // Extract base domain from the OneRoster URL for OAuth endpoint
//   const baseUrlParts = baseUrl.replace(/\/+$/, "").split("/");
//   const domain = baseUrlParts.slice(0, 3).join("/"); // https://domain.com
//   const tokenUrl = `${domain}/oauth/rest/v2.0/auth`;
// 
//   console.log("[SIS Auth] Base URL:", baseUrl);
//   console.log("[SIS Auth] Extracted domain:", domain);
//   console.log("[SIS Auth] Token URL:", tokenUrl);
// 
//   try {
//     // Create Basic Auth header with client credentials
//     const credentials = Utilities.base64Encode(`${clientId}:${secret}`);
// 
//     console.log("[SIS Auth] Making OAuth token request...");
// 
//     const response = UrlFetchApp.fetch(tokenUrl, {
//       method: "POST",
//       headers: {
//         "Authorization": `Basic ${credentials}`,
//         "Content-Type": "application/x-www-form-urlencoded",
//         "Accept": "application/json"
//       },
//       payload: "grant_type=client_credentials"
//     });
// 
//     console.log("[SIS Auth] Token response status:", response.getResponseCode());
// 
//     if (response.getResponseCode() !== 200) {
//       const errorText = response.getContentText();
//       console.error("[SIS Auth] Token request failed:", errorText);
//       throw new Error(`OAuth authentication failed: ${response.getResponseCode()} - ${errorText}`);
//     }
// 
//     const tokenData = JSON.parse(response.getContentText());
//     console.log("[SIS Auth] Token data received:", {
//       hasAccessToken: !!tokenData.access_token,
//       tokenType: tokenData.token_type,
//       expiresIn: tokenData.expires_in
//     });
// 
//     if (!tokenData.access_token) {
//       throw new Error("No access token received from SIS OAuth endpoint");
//     }
// 
//     return tokenData.access_token;
// 
//   } catch (error) {
//     console.error("[SIS Auth] Authentication error:", error);
//     throw new Error(`SIS authentication failed: ${error.message}`);
//   }
// }
// 
// /**
//  * Look up student by email using OneRoster v1.1 API
//  * @param {string} email - Student email address
//  * @param {string} authToken - OAuth access token
//  * @param {string} baseUrl - SIS API base URL
//  * @returns {Object} Student object
//  */
// function lookupStudentByEmail(email, authToken, baseUrl) {
//   console.log("[SIS Lookup] Looking up student:", email);
// 
//   // OneRoster v1.1 endpoint for users with email filter
//   const encodedEmail = encodeURIComponent(`email='${email}'`);
//   const cleanBaseUrl = baseUrl.replace(/\/+$/, ""); // Remove trailing slashes
//   const url = `${cleanBaseUrl}/users?limit=100&offset=0&orderBy=asc&filter=${encodedEmail}`;
// 
//   console.log("[SIS Lookup] Base URL:", baseUrl);
//   console.log("[SIS Lookup] Clean base URL:", cleanBaseUrl);
//   console.log("[SIS Lookup] Request URL:", url);
// 
//   try {
//     const response = UrlFetchApp.fetch(url, {
//       headers: {
//         "Accept": "application/json",
//         "Authorization": `Bearer ${authToken}`
//       }
//     });
// 
//     console.log("[SIS Lookup] Response status:", response.getResponseCode());
// 
//     if (response.getResponseCode() !== 200) {
//       const errorText = response.getContentText();
//       console.log("[SIS Lookup] Error response:", errorText);
//       throw new Error(`SIS API error looking up student: ${response.getResponseCode()} - ${errorText}`);
//     }
// 
//     const data = JSON.parse(response.getContentText());
//     console.log("[SIS Lookup] Response data:", JSON.stringify(data, null, 2));
// 
//     // OneRoster v1.1 response structure
//     if (!data.users || data.users.length === 0) {
//       throw new Error(`Student not found with email: ${email}`);
//     }
// 
//     // Find student (role = 'student')
//     const student = data.users.find(user => user.role === "student");
//     if (!student) {
//       throw new Error(`No student found with email: ${email} (found ${data.users.length} users but none with role 'student')`);
//     }
// 
//     return student;
// 
//   } catch (error) {
//     console.error("[SIS Lookup] Student lookup error:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Fetch student's classes using OneRoster v1.1 API
//  * @param {Object} student - Student object with sourcedId
//  * @param {string} authToken - OAuth access token
//  * @param {string} baseUrl - SIS API base URL
//  * @returns {Object} Classes data
//  */
// function fetchStudentClasses(student, authToken, baseUrl) {
//   console.log("[SIS Classes] Fetching classes for student:", (student && student.sourcedId) || "unknown");
// 
//   if (!student || !student.sourcedId) {
//     throw new Error("Student sourcedId is required to fetch classes");
//   }
// 
//   // OneRoster v1.1 endpoint for student's classes
//   const cleanBaseUrl = baseUrl.replace(/\/+$/, ""); // Remove trailing slashes
//   const url = `${cleanBaseUrl}/students/${student.sourcedId}/classes?limit=100&offset=0&orderBy=asc`;
// 
//   console.log("[SIS Classes] Base URL:", baseUrl);
//   console.log("[SIS Classes] Clean base URL:", cleanBaseUrl);
//   console.log("[SIS Classes] Request URL:", url);
// 
//   try {
//     const response = UrlFetchApp.fetch(url, {
//       headers: {
//         "Accept": "application/json",
//         "Authorization": `Bearer ${authToken}`
//       }
//     });
// 
//     console.log("[SIS Classes] Response status:", response.getResponseCode());
// 
//     if (response.getResponseCode() !== 200) {
//       const errorText = response.getContentText();
//       console.log("[SIS Classes] Error response:", errorText);
//       throw new Error(`SIS API error getting classes: ${response.getResponseCode()} - ${errorText}`);
//     }
// 
//     const data = JSON.parse(response.getContentText());
//     console.log("[SIS Classes] Response data:", JSON.stringify(data, null, 2));
// 
//     return data;
// 
//   } catch (error) {
//     console.error("[SIS Classes] Classes fetch error:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Analyze student schedule - placeholder for actual analysis logic
//  * @param {Object} student - Student object
//  * @param {Object} schedule - Schedule data
//  * @returns {Object} Analysis results
//  */
// function analyzeStudentSchedule(student, schedule) {
//   console.log("[SIS Analysis] Analyzing schedule for student:", (student && student.sourcedId) || "unknown");
// 
//   // Placeholder: Implement actual analysis logic here
//   const analysis = {
//     totalCredits: 0,
//     classesCount: 0,
//     // Add more analysis fields as needed
//   };
// 
//   if (schedule && schedule.classes && Array.isArray(schedule.classes)) {
//     analysis.classesCount = schedule.classes.length;
//     // Calculate total credits or other metrics based on schedule data
//   } else if (Array.isArray(schedule)) {
//     analysis.classesCount = schedule.length;
//   }
// 
//   console.log("[SIS Analysis] Schedule analysis result:", analysis);
//   return analysis;
// }
// 
// /**
//  * Simple test function to verify the setup
//  * Run this first after filling in your secrets
//  */
// function testSISSetup() {
//   console.log("=== Testing SIS API Setup ===");
// 
//   try {
//     // Test 1: Check configuration
//     console.log("1. Testing configuration...");
//     const result1 = testSISConnectivity();
//     console.log("✓ Configuration test passed:", result1);
// 
//     // Test 2: Test authentication
//     console.log("2. Testing authentication...");
//     const result2 = testSISAuthentication();
//     console.log("✓ Authentication test passed:", result2);
// 
//     console.log("=== SIS API Setup Complete ===");
//     console.log("Next steps:");
//     console.log("- Run testStudentLookup('student@example.com') with a real student email");
//     console.log("- Run testScheduleLookup('student@example.com') to test schedule fetching");
//     console.log("- Run testCompleteWorkflow('student@example.com') to test the full pipeline");
// 
//     return {
//       success: true,
//       message: "SIS API setup completed successfully",
//       nextSteps: [
//         "testStudentLookup('student@example.com')",
//         "testScheduleLookup('student@example.com')",
//         "testCompleteWorkflow('student@example.com')"
//       ]
//     };
// 
//   } catch (error) {
//     console.error("❌ SIS API setup failed:", error.message);
//     console.log("Please check:");
//     console.log("1. That you've filled in the correct values in Secrets.gs.js");
//     console.log("2. That your SIS API credentials are valid");
//     console.log("3. That the SIS API URL is correct and accessible");
// 
//     return {
//       success: false,
//       error: error.message,
//       troubleshooting: [
//         "Check values in Secrets.gs.js",
//         "Verify SIS API credentials",
//         "Confirm SIS API URL is accessible"
//       ]
//     };
//   }
// }
// 
// // ===== PHASE 1: DATA DISCOVERY FUNCTIONS =====
// 
// /**
//  * Get list of schools from SIS
//  * Phase 1.1: Explore Available SIS Data
//  */
// function getSISSchools() {
//   console.log("[SIS Discovery] Getting list of schools...");
// 
//   try {
//     const token = authenticateWithSIS();
//     const baseUrl = getSISUrl();
//     const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
//     const url = `${cleanBaseUrl}/schools?limit=100&offset=0&orderBy=asc`;
// 
//     console.log("[SIS Discovery] Schools URL:", url);
// 
//     const response = UrlFetchApp.fetch(url, {
//       headers: {
//         "Accept": "application/json",
//         "Authorization": `Bearer ${token}`
//       }
//     });
// 
//     console.log("[SIS Discovery] Schools response status:", response.getResponseCode());
// 
//     if (response.getResponseCode() !== 200) {
//       const errorText = response.getContentText();
//       console.error("[SIS Discovery] Schools error response:", errorText);
//       throw new Error(`SIS API error getting schools: ${response.getResponseCode()} - ${errorText}`);
//     }
// 
//     const data = JSON.parse(response.getContentText());
//     console.log("[SIS Discovery] Schools data:", JSON.stringify(data, null, 2));
// 
//     return data;
// 
//   } catch (error) {
//     console.error("[SIS Discovery] Schools lookup error:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Get list of terms/academic sessions for a specific school
//  * Phase 1.1: Explore Available SIS Data
//  * @param {string} schoolId - The school ID to get terms for
//  * @param {string} schoolYear - Optional school year filter (e.g., "2024-2025")
//  * @param {string} status - Optional status filter (e.g., "active")
//  */
// function getSISTermsForSchool(schoolId, schoolYear = null, status = null) {
//   console.log("[SIS Discovery] Getting terms for school:", schoolId);
//   if (schoolYear) console.log("[SIS Discovery] Filtering by school year:", schoolYear);
//   if (status) console.log("[SIS Discovery] Filtering by status:", status);
// 
//   try {
//     const token = authenticateWithSIS();
//     const baseUrl = getSISUrl();
//     const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
// 
//     // Build filter string
//     const filters = [];
//     if (schoolYear) {
//       filters.push(`schoolYear='${schoolYear}'`);
//     }
//     if (status) {
//       filters.push(`status='${status}'`);
//     }
// 
//     // Order by startDate descending to get most recent terms first
//     let url = `${cleanBaseUrl}/schools/${schoolId}/terms?limit=100&offset=0&sort=schoolYear&orderBy=desc`;
//     if (filters.length > 0) {
//       const filterString = encodeURIComponent(filters.join(' AND '));
//       url += `&filter=${filterString}`;
//     }
// 
//     console.log("[SIS Discovery] School terms URL:", url);
// 
//     const response = UrlFetchApp.fetch(url, {
//       headers: {
//         "Accept": "application/json",
//         "Authorization": `Bearer ${token}`
//       }
//     });
// 
//     console.log("[SIS Discovery] School terms response status:", response.getResponseCode());
// 
//     if (response.getResponseCode() !== 200) {
//       const errorText = response.getContentText();
//       console.error("[SIS Discovery] School terms error response:", errorText);
//       throw new Error(`SIS API error getting terms for school: ${response.getResponseCode()} - ${errorText}`);
//     }
// 
//     const data = JSON.parse(response.getContentText());
//     console.log("[SIS Discovery] School terms data:", JSON.stringify(data, null, 2));
// 
//     return data;
// 
//   } catch (error) {
//     console.error("[SIS Discovery] School terms lookup error:", error);
//     throw error;
//   }
// }/**
//  * Get list of terms/academic sessions from SIS (DEPRECATED - use getSISTermsForSchool)
//  * Phase 1.1: Explore Available SIS Data
//  */
// function getSISTerms() {
//   console.log("[SIS Discovery] WARNING: Global terms endpoint may not be supported");
//   console.log("[SIS Discovery] Consider using getSISTermsForSchool(schoolId) instead");
// 
//   try {
//     const token = authenticateWithSIS();
//     const baseUrl = getSISUrl();
//     const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
//     const url = `${cleanBaseUrl}/terms?limit=100&offset=0&orderBy=asc`;
// 
//     console.log("[SIS Discovery] Terms URL:", url);
// 
//     const response = UrlFetchApp.fetch(url, {
//       headers: {
//         "Accept": "application/json",
//         "Authorization": `Bearer ${token}`
//       }
//     });
// 
//     console.log("[SIS Discovery] Terms response status:", response.getResponseCode());
// 
//     if (response.getResponseCode() !== 200) {
//       const errorText = response.getContentText();
//       console.error("[SIS Discovery] Terms error response:", errorText);
//       throw new Error(`SIS API error getting terms: ${response.getResponseCode()} - ${errorText}`);
//     }
// 
//     const data = JSON.parse(response.getContentText());
//     console.log("[SIS Discovery] Terms data:", JSON.stringify(data, null, 2));
// 
//     return data;
// 
//   } catch (error) {
//     console.error("[SIS Discovery] Terms lookup error:", error);
//     throw error;
//   }
// }/**
//  * Get list of courses from SIS
//  * Phase 1.1: Explore Available SIS Data
//  */
// function getSISCourses(limit = 50) {
//   console.log("[SIS Discovery] Getting list of courses...");
// 
//   try {
//     const token = authenticateWithSIS();
//     const baseUrl = getSISUrl();
//     const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
//     const url = `${cleanBaseUrl}/courses?limit=${limit}&offset=0&orderBy=asc`;
// 
//     console.log("[SIS Discovery] Courses URL:", url);
// 
//     const response = UrlFetchApp.fetch(url, {
//       headers: {
//         "Accept": "application/json",
//         "Authorization": `Bearer ${token}`
//       }
//     });
// 
//     console.log("[SIS Discovery] Courses response status:", response.getResponseCode());
// 
//     if (response.getResponseCode() !== 200) {
//       const errorText = response.getContentText();
//       console.error("[SIS Discovery] Courses error response:", errorText);
//       throw new Error(`SIS API error getting courses: ${response.getResponseCode()} - ${errorText}`);
//     }
// 
//     const data = JSON.parse(response.getContentText());
//     console.log("[SIS Discovery] Courses data:", JSON.stringify(data, null, 2));
// 
//     return data;
// 
//   } catch (error) {
//     console.error("[SIS Discovery] Courses lookup error:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Get list of classes from SIS  
//  * Phase 1.1: Explore Available SIS Data
//  */
// function getSISClasses(limit = 50) {
//   console.log("[SIS Discovery] Getting list of classes...");
// 
//   try {
//     const token = authenticateWithSIS();
//     const baseUrl = getSISUrl();
//     const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
//     const url = `${cleanBaseUrl}/classes?limit=${limit}&offset=0&orderBy=asc`;
// 
//     console.log("[SIS Discovery] Classes URL:", url);
// 
//     const response = UrlFetchApp.fetch(url, {
//       headers: {
//         "Accept": "application/json",
//         "Authorization": `Bearer ${token}`
//       }
//     });
// 
//     console.log("[SIS Discovery] Classes response status:", response.getResponseCode());
// 
//     if (response.getResponseCode() !== 200) {
//       const errorText = response.getContentText();
//       console.error("[SIS Discovery] Classes error response:", errorText);
//       throw new Error(`SIS API error getting classes: ${response.getResponseCode()} - ${errorText}`);
//     }
// 
//     const data = JSON.parse(response.getContentText());
//     console.log("[SIS Discovery] Classes data:", JSON.stringify(data, null, 2));
// 
//     return data;
// 
//   } catch (error) {
//     console.error("[SIS Discovery] Classes lookup error:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Get classes for a specific school
//  * Phase 1.1: Explore Available SIS Data
//  */
// function getSISClassesForSchool(schoolId, limit = 50) {
//   console.log("[SIS Discovery] Getting classes for school:", schoolId);
// 
//   try {
//     const token = authenticateWithSIS();
//     const baseUrl = getSISUrl();
//     const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
//     const url = `${cleanBaseUrl}/schools/${schoolId}/classes?limit=${limit}&offset=0&orderBy=asc`;
// 
//     console.log("[SIS Discovery] School classes URL:", url);
// 
//     const response = UrlFetchApp.fetch(url, {
//       headers: {
//         "Accept": "application/json",
//         "Authorization": `Bearer ${token}`
//       }
//     });
// 
//     console.log("[SIS Discovery] School classes response status:", response.getResponseCode());
// 
//     if (response.getResponseCode() !== 200) {
//       const errorText = response.getContentText();
//       console.error("[SIS Discovery] School classes error response:", errorText);
//       throw new Error(`SIS API error getting classes for school: ${response.getResponseCode()} - ${errorText}`);
//     }
// 
//     const data = JSON.parse(response.getContentText());
//     console.log("[SIS Discovery] School classes data:", JSON.stringify(data, null, 2));
// 
//     return data;
// 
//   } catch (error) {
//     console.error("[SIS Discovery] School classes lookup error:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Comprehensive data discovery test - run this to explore your SIS data structure
//  * Phase 1.1: Explore Available SIS Data
//  */
// function exploreSISData() {
//   console.log("=== SIS DATA DISCOVERY ===");
// 
//   try {
//     // Step 1: Get schools
//     console.log("\n1. SCHOOLS:");
//     const schools = getSISSchools();
//     console.log(`Found ${schools.orgs ? schools.orgs.length : 0} schools`);
// 
//     // Step 2: Get terms for first school (since global terms endpoint may not work)
//     console.log("\n2. TERMS:");
//     if (schools.orgs && schools.orgs.length > 0) {
//       const firstSchool = schools.orgs[0];
//       console.log(`Getting terms for school: ${firstSchool.name}`);
//       try {
//         const terms = getSISTermsForSchool(firstSchool.sourcedId);
//         console.log(`Found ${terms.academicSessions ? terms.academicSessions.length : 0} terms for this school`);
//       } catch (error) {
//         console.log("Terms lookup failed for this school:", error.message);
//       }
//     } else {
//       console.log("No schools available to get terms for");
//     }
// 
//     // Step 3: Get courses (limited sample)
//     console.log("\n3. COURSES (sample):");
//     const courses = getSISCourses(10);
//     console.log(`Found ${courses.courses ? courses.courses.length : 0} courses in sample`);
// 
//     // Step 4: Get classes (limited sample)
//     console.log("\n4. CLASSES (sample):");
//     const classes = getSISClasses(10);
//     console.log(`Found ${classes.classes ? classes.classes.length : 0} classes in sample`);
// 
//     // Step 5: If we have schools, get classes for the first school
//     if (schools.orgs && schools.orgs.length > 0) {
//       const firstSchool = schools.orgs[0];
//       console.log(`\n5. CLASSES FOR SCHOOL "${firstSchool.name}" (${firstSchool.sourcedId}):`);
//       const schoolClasses = getSISClassesForSchool(firstSchool.sourcedId, 10);
//       console.log(`Found ${schoolClasses.classes ? schoolClasses.classes.length : 0} classes for this school`);
//     }
// 
//     console.log("\n=== DATA DISCOVERY COMPLETE ===");
//     console.log("Next steps:");
//     console.log("1. Review the logged data structure");
//     console.log("2. Identify which school(s) you want to sync");
//     console.log("3. Identify which classes should become Google Classrooms");
//     console.log("4. Design the tracking spreadsheet schema");
// 
//     return {
//       success: true,
//       message: "SIS data discovery completed successfully",
//       summary: {
//         schools: schools.orgs ? schools.orgs.length : 0,
//         courses: courses.courses ? courses.courses.length : 0,
//         classes: classes.classes ? classes.classes.length : 0
//       }
//     };
// 
//   } catch (error) {
//     console.error("❌ SIS data discovery failed:", error.message);
//     return {
//       success: false,
//       error: error.message
//     };
//   }
// }
// 
// // ===== CONVENIENCE FUNCTIONS FOR INNOVATION ACADEMY =====
// 
// /**
//  * Get school information for Innovation Academy schools
//  */
// function getInnovationSchools() {
//   return {
//     highSchool: {
//       name: "Innovation Academy Charter High School",
//       identifier: "HS",
//       sourcedId: "SKL0000000900b"
//     },
//     middleSchool: {
//       name: "Innovation Academy Charter Middle School",
//       identifier: "MS",
//       sourcedId: "SKL000000Giyaj"
//     }
//   };
// }
// 
// /**
//  * Log all Innovation Academy school information
//  */
// function logInnovationSchools() {
//   const schools = getInnovationSchools();
//   console.log("=== INNOVATION ACADEMY SCHOOLS ===");
//   console.log("High School:", schools.highSchool);
//   console.log("Middle School:", schools.middleSchool);
//   return schools;
// }
// 
// /**
//  * Get classes for Innovation Academy High School
//  */
// function getHighSchoolClasses(limit = 50) {
//   console.log("[Innovation] Getting High School classes...");
//   const schools = getInnovationSchools();
//   return getSISClassesForSchool(schools.highSchool.sourcedId, limit);
// }
// 
// /**
//  * Get classes for Innovation Academy Middle School
//  */
// function getMiddleSchoolClasses(limit = 50) {
//   console.log("[Innovation] Getting Middle School classes...");
//   const schools = getInnovationSchools();
//   return getSISClassesForSchool(schools.middleSchool.sourcedId, limit);
// }
// 
// /**
//  * Get classes for both Innovation Academy schools
//  */
// function getAllInnovationClasses(limit = 50) {
//   console.log("[Innovation] Getting classes for both schools...");
// 
//   try {
//     const hsClasses = getHighSchoolClasses(limit);
//     const msClasses = getMiddleSchoolClasses(limit);
// 
//     const result = {
//       highSchool: {
//         school: getInnovationSchools().highSchool,
//         classes: hsClasses.classes || [],
//         count: hsClasses.classes ? hsClasses.classes.length : 0
//       },
//       middleSchool: {
//         school: getInnovationSchools().middleSchool,
//         classes: msClasses.classes || [],
//         count: msClasses.classes ? msClasses.classes.length : 0
//       }
//     };
// 
//     console.log(`[Innovation] Found ${result.highSchool.count} HS classes and ${result.middleSchool.count} MS classes`);
//     return result;
// 
//   } catch (error) {
//     console.error("[Innovation] Error getting classes:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Get terms for Innovation Academy High School
//  */
// function getHighSchoolTerms() {
//   console.log("[Innovation] Getting High School terms...");
//   const schools = getInnovationSchools();
//   return getSISTermsForSchool(schools.highSchool.sourcedId);
// }
// 
// /**
//  * Get terms for Innovation Academy Middle School
//  */
// function getMiddleSchoolTerms() {
//   console.log("[Innovation] Getting Middle School terms...");
//   const schools = getInnovationSchools();
//   return getSISTermsForSchool(schools.middleSchool.sourcedId);
// }
// 
// /**
//  * Get terms for both Innovation Academy schools
//  */
// /**
//  * Get current school year terms for Innovation Academy schools
//  * This returns only terms for the current academic year (2024-2025)
//  */
// function getCurrentInnovationTerms() {
//   console.log("[Innovation] Getting current school year terms for both schools...");
// 
//   try {
//     // Get current school year - you might want to make this dynamic
//     const currentSchoolYear = "2024-2025";
// 
//     const schools = getInnovationSchools();
//     const hsTerms = getSISTermsForSchool(schools.highSchool.sourcedId, currentSchoolYear, "active");
//     const msTerms = getSISTermsForSchool(schools.middleSchool.sourcedId, currentSchoolYear, "active");
// 
//     const result = {
//       schoolYear: currentSchoolYear,
//       highSchool: {
//         school: schools.highSchool,
//         terms: hsTerms.academicSessions || [],
//         count: hsTerms.academicSessions ? hsTerms.academicSessions.length : 0
//       },
//       middleSchool: {
//         school: schools.middleSchool,
//         terms: msTerms.academicSessions || [],
//         count: msTerms.academicSessions ? msTerms.academicSessions.length : 0
//       }
//     };
// 
//     console.log(`[Innovation] Found ${result.highSchool.count} current HS terms and ${result.middleSchool.count} current MS terms`);
//     return result;
// 
//   } catch (error) {
//     console.error("[Innovation] Error getting current terms:", error);
//     throw error;
//   }
// }
// 
// function getAllInnovationTerms() {
//   console.log("[Innovation] Getting terms for both schools...");
// 
//   try {
//     const hsTerms = getHighSchoolTerms();
//     const msTerms = getMiddleSchoolTerms();
// 
//     const result = {
//       highSchool: {
//         school: getInnovationSchools().highSchool,
//         terms: hsTerms.academicSessions || [],
//         count: hsTerms.academicSessions ? hsTerms.academicSessions.length : 0
//       },
//       middleSchool: {
//         school: getInnovationSchools().middleSchool,
//         terms: msTerms.academicSessions || [],
//         count: msTerms.academicSessions ? msTerms.academicSessions.length : 0
//       }
//     };
// 
//     console.log(`[Innovation] Found ${result.highSchool.count} HS terms and ${result.middleSchool.count} MS terms`);
//     return result;
// 
//   } catch (error) {
//     console.error("[Innovation] Error getting terms:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Explore classes for Innovation Academy - focused discovery
//  */
// function exploreInnovationClasses() {
//   console.log("=== INNOVATION ACADEMY CLASS DISCOVERY ===");
// 
//   try {
//     const schools = logInnovationSchools();
//     console.log("\nGetting classes for both schools...");
// 
//     const allClasses = getAllInnovationClasses(20); // Limit to 20 per school for initial exploration
// 
//     console.log("\n=== HIGH SCHOOL CLASSES ===");
//     if (allClasses.highSchool.classes.length > 0) {
//       allClasses.highSchool.classes.forEach((cls, index) => {
//         console.log(`${index + 1}. ${cls.title} (${cls.classCode}) - ${cls.sourcedId}`);
//         if (cls.course) console.log(`   Course: ${cls.course.sourcedId}`);
//         if (cls.periods) console.log(`   Periods: ${cls.periods.join(', ')}`);
//       });
//     } else {
//       console.log("No classes found for High School");
//     }
// 
//     console.log("\n=== MIDDLE SCHOOL CLASSES ===");
//     if (allClasses.middleSchool.classes.length > 0) {
//       allClasses.middleSchool.classes.forEach((cls, index) => {
//         console.log(`${index + 1}. ${cls.title} (${cls.classCode}) - ${cls.sourcedId}`);
//         if (cls.course) console.log(`   Course: ${cls.course.sourcedId}`);
//         if (cls.periods) console.log(`   Periods: ${cls.periods.join(', ')}`);
//       });
//     } else {
//       console.log("No classes found for Middle School");
//     }
// 
//     console.log("\n=== SUMMARY ===");
//     console.log(`Total High School classes: ${allClasses.highSchool.count}`);
//     console.log(`Total Middle School classes: ${allClasses.middleSchool.count}`);
//     console.log(`Total classes: ${allClasses.highSchool.count + allClasses.middleSchool.count}`);
// 
//     return allClasses;
// 
//   } catch (error) {
//     console.error("❌ Innovation class discovery failed:", error.message);
//     return {
//       success: false,
//       error: error.message
//     };
//   }
// }
// 
// 
// // SIS API Integration for Google Apps Script
// // Converted from AWS Lambda to Google Apps Script
// 
// /*
// ORIGINAL AWS LAMBDA CODE (for reference):
// // Test new Aspen sync method.
// 
// // Simple step-by-step SIS API testing endpoint
// import type { APIGatewayEvent, Context } from "aws-lambda";
// declare var process: any;
// 
// export async function handler(event: APIGatewayEvent, context: Context) {
//   console.log(
//     "[SIS API] Request received:",
//     event.httpMethod,
//     event.queryStringParameters
//   );
// 
//   if (event.httpMethod !== "GET") {
//     console.log("[SIS API] Method not allowed:", event.httpMethod);
//     return {
//       statusCode: 405,
//       body: JSON.stringify({ error: "Method not allowed" }),
//     };
//   }
// 
//   const { testStep, studentEmail } = event.queryStringParameters || {};
//   console.log("[SIS API] Test step:", testStep, "Student email:", studentEmail);
// 
//   try {
//     // Step A: Basic connectivity test
//     if (testStep === "connect") {
//       console.log("[SIS API] Testing basic connectivity...");
//       const clientId = process.env.SIS_CLIENT_IDENTIFIER;
//       const secret = process.env.SIS_SECRET;
//       const url = process.env.SIS_URL;
// 
//       return {
//         statusCode: 200,
//         body: JSON.stringify({
//           success: true,
//           message: "SIS API endpoint is reachable",
//           timestamp: new Date().toISOString(),
//           environment: {
//             hasClientId: !!clientId,
//             hasSecret: !!secret,
//             hasUrl: !!url,
//             clientIdLength: clientId?.length || 0,
//             urlValue: url || "not set",
//           },
//         }),
//       };
//     }
// 
//     // Step B: Test SIS authentication
//     if (testStep === "auth") {
//       console.log("[SIS API] Testing SIS authentication...");
//       try {
//         const token = await authenticateWithSIS();
//         console.log(
//           "[SIS API] Authentication successful, token length:",
//           token?.length || 0
//         );
//         return {
//           statusCode: 200,
//           body: JSON.stringify({
//             success: true,
//             message: "SIS authentication successful",
//             hasToken: !!token,
//             tokenPreview: token ? token.substring(0, 20) + "..." : "no token",
//           }),
//         };
//       } catch (authError: any) {
//         console.error("[SIS API] Authentication failed:", authError.message);
//         return {
//           statusCode: 401,
//           body: JSON.stringify({
//             error: "SIS authentication failed",
//             details: authError.message,
//           }),
//         };
//       }
//     }
// 
//     // Step C: Test student lookup by email
//     if (testStep === "student" && studentEmail) {
//       console.log("[SIS API] Testing student lookup for:", studentEmail);
//       try {
//         const token = await authenticateWithSIS();
//         const baseUrl = process.env.SIS_URL || "";
//         const student = await lookupStudentByEmail(
//           studentEmail,
//           token,
//           baseUrl
//         );
//         console.log("[SIS API] Student found:", student || "No student data");
//         return {
//           statusCode: 200,
//           body: JSON.stringify({
//             success: true,
//             message: "Student lookup successful",
//             student: student,
//           }),
//         };
//       } catch (lookupError: any) {
//         console.error("[SIS API] Student lookup failed:", lookupError.message);
//         return {
//           statusCode: 404,
//           body: JSON.stringify({
//             error: "Student lookup failed",
//             details: lookupError.message,
//           }),
//         };
//       }
//     }
// 
//     // Step D: Test schedule lookup
//     if (testStep === "schedule" && studentEmail) {
//       console.log("[SIS API] Testing schedule lookup for:", studentEmail);
//       try {
//         const token = await authenticateWithSIS();
//         const baseUrl = process.env.SIS_URL || "";
//         const student = await lookupStudentByEmail(
//           studentEmail,
//           token,
//           baseUrl
//         );
//         const schedule = await fetchStudentClasses(student, token, baseUrl);
//         console.log(
//           "[SIS API] Schedule fetched, courses:",
//           Array.isArray(schedule) ? schedule.length : "not array"
//         );
//         return {
//           statusCode: 200,
//           body: JSON.stringify({
//             success: true,
//             message: "Schedule lookup successful",
//             student: student,
//             schedule: schedule,
//           }),
//         };
//       } catch (scheduleError: any) {
//         console.error(
//           "[SIS API] Schedule lookup failed:",
//           scheduleError.message
//         );
//         return {
//           statusCode: 500,
//           body: JSON.stringify({
//             error: "Schedule lookup failed",
//             details: scheduleError.message,
//           }),
//         };
//       }
//     }
// 
//     // Step E: Test schedule analysis with bell schedules
//     if (testStep === "analysis" && studentEmail) {
//       console.log("[SIS API] Testing schedule analysis for:", studentEmail);
//       try {
//         const token = await authenticateWithSIS();
//         const baseUrl = process.env.SIS_URL || "";
//         const student = await lookupStudentByEmail(
//           studentEmail,
//           token,
//           baseUrl
//         );
//         const schedule = await fetchStudentClasses(student, token, baseUrl); // Perform schedule analysis
//         const analysis = analyzeStudentSchedule(student, schedule);
// 
//         console.log("[SIS API] Schedule analysis completed:", analysis);
//         return {
//           statusCode: 200,
//           body: JSON.stringify({
//             success: true,
//             message: "Schedule analysis successful",
//             student: student,
//             schedule: schedule,
//             analysis: analysis,
//           }),
//         };
//       } catch (analysisError: any) {
//         console.error(
//           "[SIS API] Schedule analysis failed:",
//           analysisError.message
//         );
//         return {
//           statusCode: 500,
//           body: JSON.stringify({
//             error: "Schedule analysis failed",
//             details: analysisError.message,
//           }),
//         };
//       }
//     }
// 
//     // Default usage info
//     console.log("[SIS API] Missing required parameters");
//     return {
//       statusCode: 400,
//       body: JSON.stringify({
//         error: "Missing required parameters",
//         usage:
//           "Use testStep=connect|auth|student|schedule|analysis and studentEmail for student/schedule tests",
//       }),
//     };
//   } catch (error: any) {
//     console.error("[SIS API] Unexpected error:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         error: error.message || "Internal server error",
//         details: error.stack,
//       }),
//     };
//   }
// }
// 
// // Simple authentication function - OAuth 2.0 client credentials flow
// async function authenticateWithSIS(): Promise<string> {
//   const clientId = process.env.SIS_CLIENT_IDENTIFIER;
//   const secret = process.env.SIS_SECRET;
//   const baseUrl = process.env.SIS_URL;
// 
//   console.log("[SIS Auth] Starting OAuth 2.0 authentication...");
//   console.log(
//     "[SIS Auth] Client ID:",
//     clientId ? `${clientId.substring(0, 8)}...` : "missing"
//   );
//   console.log(
//     "[SIS Auth] Secret:",
//     secret ? `${secret.substring(0, 8)}...` : "missing"
//   );
//   console.log("[SIS Auth] Base URL:", baseUrl || "missing");
// 
//   if (!clientId || !secret || !baseUrl) {
//     throw new Error(
//       "SIS API configuration missing - need SIS_CLIENT_IDENTIFIER, SIS_SECRET, and SIS_URL environment variables"
//     );
//   }
// 
//   // OAuth 2.0 Client Credentials Flow
//   // Extract base domain from the OneRoster URL for OAuth endpoint
//   const baseUrlParts = baseUrl.replace(/\/+$/, "").split("/");
//   const domain = baseUrlParts.slice(0, 3).join("/"); // https://domain.com
//   const tokenUrl = `${domain}/oauth/rest/v2.0/auth`;
//   console.log("[SIS Auth] Base URL:", baseUrl);
//   console.log("[SIS Auth] Extracted domain:", domain);
//   console.log("[SIS Auth] Token URL:", tokenUrl);
// 
//   try {
//     // Create Basic Auth header with client credentials (base64 encode manually)
//     const credentials = btoa(`${clientId}:${secret}`);
// 
//     console.log("[SIS Auth] Making OAuth token request...");
//     const response = await fetch(tokenUrl, {
//       method: "POST",
//       headers: {
//         Authorization: `Basic ${credentials}`,
//         "Content-Type": "application/x-www-form-urlencoded",
//         Accept: "application/json",
//       },
//       body: "grant_type=client_credentials",
//     });
// 
//     console.log("[SIS Auth] Token response status:", response.status);
// 
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("[SIS Auth] Token request failed:", errorText);
//       throw new Error(
//         `OAuth authentication failed: ${response.status} - ${errorText}`
//       );
//     }
// 
//     const tokenData = await response.json();
//     console.log("[SIS Auth] Token data received:", {
//       hasAccessToken: !!tokenData.access_token,
//       tokenType: tokenData.token_type,
//       expiresIn: tokenData.expires_in,
//     });
// 
//     if (!tokenData.access_token) {
//       throw new Error("No access token received from SIS OAuth endpoint");
//     }
// 
//     return tokenData.access_token;
//   } catch (error: any) {
//     console.error("[SIS Auth] Authentication error:", error);
//     throw new Error(`SIS authentication failed: ${error.message}`);
//   }
// }
// 
// // Simple student lookup function - OneRoster v1.1 compliant
// async function lookupStudentByEmail(
//   email: string,
//   authToken: string,
//   baseUrl: string
// ): Promise<any> {
//   console.log("[SIS Lookup] Looking up student:", email);
// 
//   // OneRoster v1.1 endpoint for users with email filter
//   const encodedEmail = encodeURIComponent(`email='${email}'`);
//   // baseUrl already includes /ims/oneroster/v1p1/, so just append the endpoint
//   const cleanBaseUrl = baseUrl.replace(/\/+$/, ""); // Remove trailing slashes
//   const url = `${cleanBaseUrl}/users?limit=100&offset=0&orderBy=asc&filter=${encodedEmail}`;
//   console.log("[SIS Lookup] Base URL:", baseUrl);
//   console.log("[SIS Lookup] Clean base URL:", cleanBaseUrl);
//   console.log("[SIS Lookup] Request URL:", url);
// 
//   const response = await fetch(url, {
//     headers: {
//       accept: "application/json",
//       Authorization: `Bearer ${authToken}`,
//     },
//   });
// 
//   console.log("[SIS Lookup] Response status:", response.status);
// 
//   if (!response.ok) {
//     const errorText = await response.text();
//     console.log("[SIS Lookup] Error response:", errorText);
//     throw new Error(
//       `SIS API error looking up student: ${response.status} - ${errorText}`
//     );
//   }
// 
//   const data = await response.json();
//   console.log("[SIS Lookup] Response data:", JSON.stringify(data, null, 2));
// 
//   // OneRoster v1.1 response structure
//   if (!data.users || data.users.length === 0) {
//     throw new Error(`Student not found with email: ${email}`);
//   }
// 
//   // Find student (role = 'student')
//   const student = data.users.find((user: any) => user.role === "student");
//   if (!student) {
//     throw new Error(
//       `No student found with email: ${email} (found ${data.users.length} users but none with role 'student')`
//     );
//   }
// 
//   return student;
// }
// 
// // Simple schedule fetch function - OneRoster v1.1 compliant
// async function fetchStudentClasses(
//   student: any,
//   authToken: string,
//   baseUrl: string
// ): Promise<any> {
//   console.log(
//     "[SIS Classes] Fetching classes for student:",
//     student?.sourcedId || "unknown"
//   );
// 
//   if (!student?.sourcedId) {
//     throw new Error("Student sourcedId is required to fetch classes");
//   }
// 
//   // OneRoster v1.1 endpoint for student's classes
//   const cleanBaseUrl = baseUrl.replace(/\/+$/, ""); // Remove trailing slashes
//   const url = `${cleanBaseUrl}/students/${student.sourcedId}/classes?limit=100&offset=0&orderBy=asc`;
//   console.log("[SIS Classes] Base URL:", baseUrl);
//   console.log("[SIS Classes] Clean base URL:", cleanBaseUrl);
//   console.log("[SIS Classes] Request URL:", url);
// 
//   const response = await fetch(url, {
//     headers: {
//       accept: "application/json",
//       Authorization: `Bearer ${authToken}`,
//     },
//   });
// 
//   console.log("[SIS Classes] Response status:", response.status);
// 
//   if (!response.ok) {
//     const errorText = await response.text();
//     console.log("[SIS Classes] Error response:", errorText);
//     throw new Error(
//       `SIS API error getting classes: ${response.status} - ${errorText}`
//     );
//   }
// 
//   const data = await response.json();
//   console.log("[SIS Classes] Response data:", JSON.stringify(data, null, 2));
// 
//   return data;
// }
// 
// // Simple schedule analysis function - placeholder for actual analysis logic
// function analyzeStudentSchedule(student: any, schedule: any): any {
//   console.log(
//     "[SIS Analysis] Analyzing schedule for student:",
//     student?.sourcedId || "unknown"
//   );
// 
//   // Placeholder: Implement actual analysis logic here
//   const analysis = {
//     totalCredits: 0,
//     classesCount: 0,
//     // Add more analysis fields as needed
//   };
// 
//   if (Array.isArray(schedule)) {
//     analysis.classesCount = schedule.length;
//     // Calculate total credits or other metrics based on schedule data
//   }
// 
//   console.log("[SIS Analysis] Schedule analysis result:", analysis);
//   return analysis;
// }
// */
// 
// // ===== PHASE 1.2: CORE API FUNCTIONS FOR CLASSROOM CREATION =====
// 
// // Cache for academic sessions and terms to avoid expensive API calls
// const SIS_CACHE = {
//   academicSessions: new Map(),
//   terms: new Map(),
//   lastCacheTime: null,
//   cacheTimeout: 30 * 60 * 1000 // 30 minutes
// };
// 
// /**
//  * Fetch academic session details by ID with caching
//  * @param {string} sessionId - Academic session sourcedId
//  * @param {string} token - Auth token
//  * @param {string} baseUrl - SIS API base URL
//  * @returns {Object} Academic session details
//  */
// function getAcademicSessionDetails(sessionId, token, baseUrl) {
//   // Check cache first
//   if (SIS_CACHE.academicSessions.has(sessionId)) {
//     console.log(`[Cache] Using cached academic session: ${sessionId}`);
//     return SIS_CACHE.academicSessions.get(sessionId);
//   }
// 
//   console.log(`[SIS API] Fetching academic session details: ${sessionId}`);
// 
//   try {
//     const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
//     const url = `${cleanBaseUrl}/academicSessions/${sessionId}`;
// 
//     const response = UrlFetchApp.fetch(url, {
//       headers: {
//         "Accept": "application/json",
//         "Authorization": `Bearer ${token}`
//       }
//     });
// 
//     if (response.getResponseCode() !== 200) {
//       console.log(`[SIS API] Could not fetch academic session ${sessionId}: ${response.getResponseCode()}`);
//       return null;
//     }
// 
//     const data = JSON.parse(response.getContentText());
//     const sessionData = data.academicSession || data;
// 
//     // Cache the result
//     SIS_CACHE.academicSessions.set(sessionId, sessionData);
// 
//     console.log(`[SIS API] Cached academic session: ${sessionId} (${sessionData.title || sessionData.schoolYear || 'no title'})`);
//     return sessionData;
// 
//   } catch (error) {
//     console.error(`[SIS API] Error fetching academic session ${sessionId}:`, error.message);
//     return null;
//   }
// }
// 
// /**
//  * Fetch term details by ID with caching
//  * @param {string} termId - Term sourcedId  
//  * @param {string} token - Auth token
//  * @param {string} baseUrl - SIS API base URL
//  * @returns {Object} Term details
//  */
// function getTermDetails(termId, token, baseUrl) {
//   // Check cache first
//   if (SIS_CACHE.terms.has(termId)) {
//     console.log(`[Cache] Using cached term: ${termId}`);
//     return SIS_CACHE.terms.get(termId);
//   }
// 
//   console.log(`[SIS API] Fetching term details: ${termId}`);
// 
//   try {
//     const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
//     const url = `${cleanBaseUrl}/terms/${termId}`;
// 
//     const response = UrlFetchApp.fetch(url, {
//       headers: {
//         "Accept": "application/json",
//         "Authorization": `Bearer ${token}`
//       }
//     });
// 
//     if (response.getResponseCode() !== 200) {
//       console.log(`[SIS API] Could not fetch term ${termId}: ${response.getResponseCode()}`);
//       return null;
//     }
// 
//     const data = JSON.parse(response.getContentText());
//     const termData = data.academicSession || data;
// 
//     // Cache the result
//     SIS_CACHE.terms.set(termId, termData);
// 
//     console.log(`[SIS API] Cached term: ${termId} (${termData.title || 'no title'})`);
//     return termData;
// 
//   } catch (error) {
//     console.error(`[SIS API] Error fetching term ${termId}:`, error.message);
//     return null;
//   }
// }
// 
// /**
//  * Bulk fetch and cache academic sessions and terms for a class
//  * This minimizes API calls by fetching all referenced sessions/terms at once
//  * @param {Object} sisClass - SIS class data
//  * @param {string} token - Auth token  
//  * @param {string} baseUrl - SIS API base URL
//  */
// function preloadAcademicData(sisClass, token, baseUrl) {
//   console.log(`[Cache] Preloading academic data for class: ${sisClass.sourcedId}`);
// 
//   const toFetch = {
//     academicSessions: new Set(),
//     terms: new Set()
//   };
// 
//   // Collect all referenced academic sessions and terms
//   // Check multiple possible locations for school year
//   let schoolYearRef = null;
//   if (sisClass.schoolYear && sisClass.schoolYear.sourcedId) {
//     schoolYearRef = sisClass.schoolYear;
//   } else if (sisClass.course && sisClass.course.schoolYear && sisClass.course.schoolYear.sourcedId) {
//     schoolYearRef = sisClass.course.schoolYear;
//   }
// 
//   if (schoolYearRef && !SIS_CACHE.academicSessions.has(schoolYearRef.sourcedId)) {
//     toFetch.academicSessions.add(schoolYearRef.sourcedId);
//   }
// 
//   if (sisClass.terms && Array.isArray(sisClass.terms)) {
//     sisClass.terms.forEach(term => {
//       if (term.sourcedId && !SIS_CACHE.terms.has(term.sourcedId)) {
//         toFetch.terms.add(term.sourcedId);
//       }
//     });
//   }
// 
//   // Fetch academic sessions
//   toFetch.academicSessions.forEach(sessionId => {
//     getAcademicSessionDetails(sessionId, token, baseUrl);
//   });
// 
//   // Fetch terms  
//   toFetch.terms.forEach(termId => {
//     getTermDetails(termId, token, baseUrl);
//   });
// 
//   console.log(`[Cache] Preloaded ${toFetch.academicSessions.size} academic sessions and ${toFetch.terms.size} terms`);
// }
// 
// /**
//  * Clear the SIS cache (useful for testing or if data becomes stale)
//  */
// function clearSISCache() {
//   SIS_CACHE.academicSessions.clear();
//   SIS_CACHE.terms.clear();
//   SIS_CACHE.lastCacheTime = null;
//   console.log("[Cache] SIS cache cleared");
// }
// 
// /**
//  * Get enhanced class data with resolved academic session and term details
//  * @param {Object} sisClass - SIS class data
//  * @param {string} token - Auth token
//  * @param {string} baseUrl - SIS API base URL  
//  * @returns {Object} Enhanced class data with resolved academic details
//  */
// function enhanceClassWithAcademicData(sisClass, token, baseUrl) {
//   debugger; // DEBUG: Start of enhancement function
//   console.log("[DEBUG] enhanceClassWithAcademicData - sisClass structure:", JSON.stringify(sisClass, null, 2));
// 
//   // Preload any missing academic data
//   preloadAcademicData(sisClass, token, baseUrl);
// 
//   const enhanced = { ...sisClass };
// 
//   // Enhance school year data - check multiple possible locations
//   let schoolYearRef = null;
// 
//   debugger; // DEBUG: Check school year locations
//   console.log("[DEBUG] Checking sisClass.schoolYear:", sisClass.schoolYear);
//   console.log("[DEBUG] Checking sisClass.course:", sisClass.course);
//   if (sisClass.course) {
//     console.log("[DEBUG] Checking sisClass.course.schoolYear:", sisClass.course.schoolYear);
//   }
// 
//   // Try sisClass.schoolYear first
//   if (sisClass.schoolYear && sisClass.schoolYear.sourcedId) {
//     schoolYearRef = sisClass.schoolYear;
//     console.log("[DEBUG] Found school year in sisClass.schoolYear:", schoolYearRef.sourcedId);
//   }
//   // Try sisClass.course.schoolYear if course exists
//   else if (sisClass.course && sisClass.course.schoolYear && sisClass.course.schoolYear.sourcedId) {
//     schoolYearRef = sisClass.course.schoolYear;
//     console.log("[DEBUG] Found school year in sisClass.course.schoolYear:", schoolYearRef.sourcedId);
//   }
// 
//   debugger; // DEBUG: About to fetch academic session details
//   if (schoolYearRef) {
//     console.log("[DEBUG] Fetching academic session details for:", schoolYearRef.sourcedId);
//     const schoolYearDetails = getAcademicSessionDetails(schoolYearRef.sourcedId, token, baseUrl);
//     console.log("[DEBUG] Academic session details result:", schoolYearDetails);
//     if (schoolYearDetails) {
//       enhanced.schoolYearDetails = schoolYearDetails;
//       enhanced.schoolYearTitle = schoolYearDetails.title || schoolYearDetails.schoolYear;
//       console.log("[DEBUG] Enhanced with school year title:", enhanced.schoolYearTitle);
//     }
//   } else {
//     console.log("[DEBUG] No school year reference found!");
//   }
// 
//   // Enhance terms data
//   if (sisClass.terms && Array.isArray(sisClass.terms)) {
//     enhanced.termsDetails = [];
//     sisClass.terms.forEach(term => {
//       const termDetails = getTermDetails(term.sourcedId, token, baseUrl);
//       if (termDetails) {
//         enhanced.termsDetails.push(termDetails);
//       }
//     });
// 
//     // Extract useful term info for naming
//     enhanced.termTitles = enhanced.termsDetails.map(t => t.title).filter(Boolean);
//     enhanced.termCodes = enhanced.termsDetails.map(t => t.termCode || extractTermCode(t.title)).filter(Boolean);
//   }
// 
//   return enhanced;
// }
// 
// /**
//  * Extract term code from term title (e.g., "Semester 1 2025-2026" -> "S1")
//  * @param {string} termTitle - Term title
//  * @returns {string} Extracted term code
//  */
// function extractTermCode(termTitle) {
//   if (!termTitle) return "";
// 
//   const title = termTitle.toLowerCase();
// 
//   // Common patterns
//   if (title.includes("semester 1") || title.includes("sem 1")) return "S1";
//   if (title.includes("semester 2") || title.includes("sem 2")) return "S2";
//   if (title.includes("quarter 1") || title.includes("q1")) return "Q1";
//   if (title.includes("quarter 2") || title.includes("q2")) return "Q2";
//   if (title.includes("quarter 3") || title.includes("q3")) return "Q3";
//   if (title.includes("quarter 4") || title.includes("q4")) return "Q4";
//   if (title.includes("trimester 1") || title.includes("tri 1")) return "T1";
//   if (title.includes("trimester 2") || title.includes("tri 2")) return "T2";
//   if (title.includes("trimester 3") || title.includes("tri 3")) return "T3";
//   if (title.includes("full year") || title.includes("year")) return "FY";
// 
//   // Return first word if no pattern matches
//   return termTitle.split(' ')[0].toUpperCase();
// }
// 
// /**
//  * Extract school year in short format (e.g., "2025-2026" -> "25-26")
//  * @param {string} schoolYear - School year string
//  * @returns {string} Short school year format
//  */
// function extractShortSchoolYear(schoolYear) {
//   if (!schoolYear) return "";
// 
//   // Pattern: 2025-2026 -> 25-26
//   const match = schoolYear.match(/(\d{4})-(\d{4})/);
//   if (match) {
//     const startYear = match[1].slice(-2);
//     const endYear = match[2].slice(-2);
//     return `${startYear}-${endYear}`;
//   }
// 
//   // Pattern: 2025 -> 25
//   const singleYearMatch = schoolYear.match(/(\d{4})/);
//   if (singleYearMatch) {
//     return singleYearMatch[1].slice(-2);
//   }
// 
//   return schoolYear;
// }
// 
// /**
//  * Get Google Classroom creation parameters for a single SIS class
//  * @param {string} aspenId - SIS class ID
//  * @param {Object} params - Additional parameters for classroom creation (courseState, guardiansEnabled, etc.)
//  * @param {Function} converter - Optional converter function: (aspenCourseObject) => googleParamsPartial
//  * @returns {Object} Google Classroom creation parameters (does not create classroom)
//  */
// function getGoogleClassroomCreateParams(aspenId, params = {}, converter = null) {
//   console.log("[Params Generation] Getting classroom creation params for SIS class:", aspenId);
// 
//   try {
//     // Get the complete SIS data
//     const classroomData = gatherClassroomData(aspenId);
// 
//     // Apply converter if provided
//     let convertedData = {};
//     if (converter && typeof converter === 'function') {
//       // Pass the raw SIS data to the converter
//       const sisData = {
//         class: classroomData.sisClass,
//         course: classroomData.sisCourse,
//         teacher: classroomData.sisTeacher
//       };
//       convertedData = converter(sisData) || {};
//       console.log("[Params Generation] Converter applied:", JSON.stringify(convertedData, null, 2));
//     }
// 
//     // Merge data: base mapping < converter results < explicit params
//     const finalClassroomData = {
//       ...classroomData,
//       ...convertedData,
//       ...params
//     };
// 
//     console.log("[Params Generation] Final classroom params:", JSON.stringify(finalClassroomData, null, 2));
// 
//     return finalClassroomData;
// 
//   } catch (error) {
//     console.error("[Params Generation] Error generating classroom params:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Get Google Classroom creation parameters for multiple SIS classes
//  * @param {Object|Function} filter - Filter criteria or function: (aspenCourseObject) => boolean
//  * @param {Object} params - Additional parameters for classroom creation
//  * @param {Function} converter - Optional converter function: (aspenCourseObject) => googleParamsPartial
//  * @returns {Array} Array of Google Classroom creation parameters (does not create classrooms)
//  */
// function getGoogleClassroomCreateParamsMultiple(filter = {}, params = {}, converter = null) {
//   console.log("[Params Generation] Getting classroom creation params with filter:", filter);
// 
//   try {
//     // Get SIS classes based on filter
//     const classes = getSISClassesWithFilter(filter);
// 
//     console.log(`[Params Generation] Found ${classes.length} classes matching filter`);
// 
//     const results = [];
// 
//     for (const sisClass of classes) {
//       try {
//         console.log(`[Params Generation] Processing class: ${sisClass.title} (${sisClass.sourcedId})`);
// 
//         // Get params for this class
//         const classroomParams = getGoogleClassroomCreateParams(sisClass.sourcedId, params, converter);
// 
//         results.push({
//           success: true,
//           sisClassId: sisClass.sourcedId,
//           classroomParams: classroomParams,
//           sisClass: sisClass
//         });
// 
//       } catch (error) {
//         console.error(`[Params Generation] Error getting params for ${sisClass.sourcedId}:`, error);
//         results.push({
//           success: false,
//           sisClassId: sisClass.sourcedId,
//           error: error.message,
//           sisClass: sisClass
//         });
//       }
//     }
// 
//     const successCount = results.filter(r => r.success).length;
//     console.log(`[Params Generation] Completed: ${successCount}/${results.length} class params generated successfully`);
// 
//     return results;
// 
//   } catch (error) {
//     console.error("[Params Generation] Error in bulk params generation:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Create a single Google Classroom from SIS class data
//  * @param {string} aspenId - SIS class ID
//  * @param {Object} params - Additional parameters for classroom creation (courseState, guardiansEnabled, etc.)
//  * @param {Function} converter - Optional converter function: (aspenCourseObject) => googleParamsPartial
//  * @returns {Object} Created Google Classroom object
//  */
// function createCourse(aspenId, params = {}, converter = null) {
//   console.log("[Course Creation] Creating course for SIS class:", aspenId);
// 
//   try {
//     // Get the classroom creation parameters
//     const classroomParams = getGoogleClassroomCreateParams(aspenId, params, converter);
// 
//     // Create the classroom
//     const classroom = createGoogleClassroom(classroomParams);
// 
//     return classroom;
// 
//   } catch (error) {
//     console.error("[Course Creation] Error creating course:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Create multiple Google Classrooms from SIS data
//  * @param {Object|Function} filter - Filter criteria or function: (aspenCourseObject) => boolean
//  * @param {Object} params - Additional parameters for classroom creation
//  * @param {Function} converter - Optional converter function: (aspenCourseObject) => googleParamsPartial
//  * @returns {Array} Array of creation results
//  */
// function createCourses(filter = {}, params = {}, converter = null) {
//   console.log("[Courses Creation] Creating multiple courses with filter:", filter);
// 
//   try {
//     // Get all the classroom creation parameters first
//     const classroomParamsArray = getGoogleClassroomCreateParamsMultiple(filter, params, converter);
// 
//     console.log(`[Courses Creation] Got parameters for ${classroomParamsArray.length} courses`);
// 
//     const results = [];
// 
//     for (const paramSet of classroomParamsArray) {
//       if (!paramSet.success) {
//         // Pass through parameter generation errors
//         results.push(paramSet);
//         continue;
//       }
// 
//       try {
//         console.log(`[Courses Creation] Creating classroom for: ${paramSet.sisClass.title} (${paramSet.sisClassId})`);
// 
//         // Create the actual classroom
//         const classroom = createGoogleClassroom(paramSet.classroomParams);
// 
//         results.push({
//           success: true,
//           sisClassId: paramSet.sisClassId,
//           classroomId: classroom.id,
//           classroom: classroom,
//           sisClass: paramSet.sisClass,
//           classroomParams: paramSet.classroomParams
//         });
// 
//       } catch (error) {
//         console.error(`[Courses Creation] Error creating classroom for ${paramSet.sisClassId}:`, error);
//         results.push({
//           success: false,
//           sisClassId: paramSet.sisClassId,
//           error: error.message,
//           sisClass: paramSet.sisClass,
//           classroomParams: paramSet.classroomParams
//         });
//       }
//     }
// 
//     const successCount = results.filter(r => r.success).length;
//     console.log(`[Courses Creation] Completed: ${successCount}/${results.length} courses created successfully`);
// 
//     return results;
// 
//   } catch (error) {
//     console.error("[Courses Creation] Error in bulk course creation:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Get SIS classes with filtering support
//  * @param {Object|Function} filter - Filter criteria or custom filter function
//  * @returns {Array} Filtered array of SIS classes
//  */
// function getSISClassesWithFilter(filter = {}) {
//   console.log("[Filter] Getting SIS classes with filter:", filter);
// 
//   try {
//     let allClasses = [];
// 
//     // If filter specifies schools, get classes for those schools
//     if (filter.schools) {
//       for (const schoolId of filter.schools) {
//         const schoolClasses = getSISClassesForSchool(schoolId, filter.limit || 100);
//         if (schoolClasses.classes) {
//           allClasses = [...allClasses, ...schoolClasses.classes];
//         }
//       }
//     } else {
//       // Default to Innovation Academy schools
//       const innovationClasses = getAllInnovationClasses(filter.limit || 100);
//       allClasses = [
//         ...innovationClasses.highSchool.classes,
//         ...innovationClasses.middleSchool.classes
//       ];
//     }
// 
//     console.log(`[Filter] Got ${allClasses.length} total classes before filtering`);
// 
//     // Apply built-in filters
//     let filteredClasses = allClasses;
// 
//     // Filter by school year
//     if (filter.schoolYear) {
//       filteredClasses = filteredClasses.filter(cls => {
//         return cls.terms && cls.terms.some(term =>
//           term.schoolYear === filter.schoolYear ||
//           term.sourcedId.includes(filter.schoolYear)
//         );
//       });
//       console.log(`[Filter] After school year filter: ${filteredClasses.length} classes`);
//     }
// 
//     // Filter by term
//     if (filter.term) {
//       filteredClasses = filteredClasses.filter(cls => {
//         return cls.terms && cls.terms.some(term => term.sourcedId === filter.term);
//       });
//       console.log(`[Filter] After term filter: ${filteredClasses.length} classes`);
//     }
// 
//     // Filter by subject
//     if (filter.subjects) {
//       const subjectsArray = Array.isArray(filter.subjects) ? filter.subjects : [filter.subjects];
//       filteredClasses = filteredClasses.filter(cls => {
//         return cls.subjects && cls.subjects.some(subject =>
//           subjectsArray.includes(subject)
//         );
//       });
//       console.log(`[Filter] After subjects filter: ${filteredClasses.length} classes`);
//     }
// 
//     // Apply custom filter function if provided
//     if (typeof filter === 'function') {
//       filteredClasses = allClasses.filter(filter);
//       console.log(`[Filter] After custom filter function: ${filteredClasses.length} classes`);
//     } else if (filter.customFilter && typeof filter.customFilter === 'function') {
//       filteredClasses = filteredClasses.filter(filter.customFilter);
//       console.log(`[Filter] After custom filter: ${filteredClasses.length} classes`);
//     }
// 
//     return filteredClasses;
// 
//   } catch (error) {
//     console.error("[Filter] Error filtering SIS classes:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Get detailed class information from SIS with all data needed for Google Classroom creation
//  * @param {string} classId - SIS class ID to gather data for
//  * @returns {Object} Complete class data mapped for Google Classroom creation
//  */
// function gatherClassroomData(classId) {
//   console.log("[Classroom Data] Gathering complete data for class:", classId);
// 
//   try {
//     const token = authenticateWithSIS();
//     const baseUrl = getSISUrl();
//     const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
// 
//     // Get class details
//     const classUrl = `${cleanBaseUrl}/classes/${classId}`;
//     console.log("[Classroom Data] Getting class details:", classUrl);
// 
//     const classResponse = UrlFetchApp.fetch(classUrl, {
//       headers: {
//         "Accept": "application/json",
//         "Authorization": `Bearer ${token}`
//       }
//     });
// 
//     if (classResponse.getResponseCode() !== 200) {
//       throw new Error(`Failed to get class details: ${classResponse.getResponseCode()}`);
//     }
// 
//     const classData = JSON.parse(classResponse.getContentText());
//     const sisClass = classData.class || classData;
// 
//     console.log("[Classroom Data] SIS class data:", JSON.stringify(sisClass, null, 2));
// 
//     // Get course details if available (we need this for school year info)
//     let courseData = null;
//     if (sisClass.course && sisClass.course.sourcedId) {
//       debugger; // DEBUG: About to fetch course data
//       const courseUrl = `${cleanBaseUrl}/courses/${sisClass.course.sourcedId}`;
//       console.log("[DEBUG] Getting course details:", courseUrl);
// 
//       try {
//         const courseResponse = UrlFetchApp.fetch(courseUrl, {
//           headers: {
//             "Accept": "application/json",
//             "Authorization": `Bearer ${token}`
//           }
//         });
// 
//         if (courseResponse.getResponseCode() === 200) {
//           const courseResponseData = JSON.parse(courseResponse.getContentText());
//           courseData = courseResponseData.course || courseResponseData;
// 
//           debugger; // DEBUG: Course data fetched, about to attach to sisClass
//           console.log("[DEBUG] Course data fetched:", JSON.stringify(courseData, null, 2));
// 
//           // Add course data to the class object so enhancement can find school year
//           sisClass.course = courseData;
//           console.log("[DEBUG] Course data attached to sisClass.course");
//           console.log("[DEBUG] sisClass.course.schoolYear:", sisClass.course.schoolYear);
//         }
//       } catch (error) {
//         console.log("[Classroom Data] Could not get course details:", error.message);
//       }
//     }
// 
//     debugger; // DEBUG: About to enhance class with academic data
//     console.log("[DEBUG] sisClass before enhancement:", JSON.stringify(sisClass, null, 2));
// 
//     // Enhance class with academic data (cached) - now with course data attached
//     const enhancedClass = enhanceClassWithAcademicData(sisClass, token, baseUrl);
// 
//     debugger; // DEBUG: Enhancement complete
//     console.log("[DEBUG] enhancedClass after enhancement:", JSON.stringify(enhancedClass, null, 2));    // Get teacher information
//     let teacherData = null;
//     const teachersUrl = `${cleanBaseUrl}/classes/${classId}/teachers`;
//     console.log("[Classroom Data] Getting teachers for class:", teachersUrl);
// 
//     try {
//       const teachersResponse = UrlFetchApp.fetch(teachersUrl, {
//         headers: {
//           "Accept": "application/json",
//           "Authorization": `Bearer ${token}`
//         }
//       });
// 
//       if (teachersResponse.getResponseCode() === 200) {
//         const teachersResponseData = JSON.parse(teachersResponse.getContentText());
//         console.log("[Classroom Data] Teachers response:", JSON.stringify(teachersResponseData, null, 2));
// 
//         const teachers = teachersResponseData.users || [];
// 
//         // Find primary teacher or just take the first one
//         const primaryTeacher = teachers.find(teacher =>
//           teacher.role === "primary" || teacher.role === "teacher"
//         );
// 
//         if (primaryTeacher) {
//           teacherData = primaryTeacher;
//           console.log("[Classroom Data] Found teacher:", teacherData.email || teacherData.identifier);
//         } else if (teachers.length > 0) {
//           // Fallback to first teacher if no primary
//           teacherData = teachers[0];
//           console.log("[Classroom Data] Using first teacher as fallback:", teacherData.email || teacherData.identifier);
//         }
//       }
//     } catch (error) {
//       console.log("[Classroom Data] Could not get teachers:", error.message);
//     }    // Map SIS data to Google Classroom format (now with enhanced academic data)
//     const classroomData = mapSISToGoogleClassroom(enhancedClass, courseData, teacherData);
// 
//     // Add raw SIS data for converter access (include enhanced data)
//     classroomData.sisClass = enhancedClass;
//     classroomData.sisCourse = courseData;
//     classroomData.sisTeacher = teacherData;
// 
//     console.log("[Classroom Data] Mapped classroom data:", JSON.stringify(classroomData, null, 2));
//     return classroomData;
// 
//   } catch (error) {
//     console.error("[Classroom Data] Error gathering classroom data:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Map SIS class data to Google Classroom creation format
//  * @param {Object} sisClass - SIS class data
//  * @param {Object} courseData - SIS course data (optional)
//  * @param {Object} teacherData - SIS teacher data (optional)
//  * @returns {Object} Google Classroom creation object
//  */
// function mapSISToGoogleClassroom(sisClass, courseData, teacherData) {
//   console.log("[Classroom Mapping] Mapping SIS data to Google Classroom format");
// 
//   // Build classroom name using a naming convention
//   // You can customize this logic based on your needs
//   let name = sisClass.title || sisClass.name || "Untitled Class";
// 
//   // Add course code if available
//   if (sisClass.classCode) {
//     name = `${sisClass.classCode} - ${name}`;
//   } else if (courseData && courseData.courseCode) {
//     name = `${courseData.courseCode} - ${name}`;
//   }
// 
//   // Build section name
//   let section = sisClass.period || "";
//   if (sisClass.periods && Array.isArray(sisClass.periods)) {
//     section = sisClass.periods.join(", ");
//   }
//   if (sisClass.location) {
//     section = section ? `${section} (${sisClass.location})` : sisClass.location;
//   }
// 
//   // Build description
//   let description = "";
//   if (courseData && courseData.title) {
//     description += `Course: ${courseData.title}\n`;
//   }
//   if (sisClass.periods) {
//     description += `Period(s): ${sisClass.periods.join(", ")}\n`;
//   }
//   if (sisClass.terms && sisClass.terms.length > 0) {
//     description += `Terms: ${sisClass.terms.map(t => t.sourcedId).join(", ")}\n`;
//   }
//   description += `SIS Class ID: ${sisClass.sourcedId}`;
// 
//   // Determine room
//   let room = sisClass.location || sisClass.room || "";
// 
//   // Determine owner (teacher email)
//   let ownerId = null;
//   if (teacherData && teacherData.email) {
//     ownerId = teacherData.email;
//   } else if (teacherData && teacherData.identifier) {
//     // Sometimes email might be in identifier field
//     ownerId = teacherData.identifier;
//   }
// 
//   const classroomData = {
//     name: name,
//     section: section,
//     description: description,
//     room: room,
//     ownerId: ownerId,
//     courseState: "PROVISIONED", // Start as provisioned, can be activated later
//     guardiansEnabled: true,
//     // Store SIS metadata for tracking
//     sisClassId: sisClass.sourcedId,
//     sisCourseId: courseData ? courseData.sourcedId : null,
//     sisTeacherId: teacherData ? teacherData.sourcedId : null
//   };
// 
//   console.log("[Classroom Mapping] Mapped classroom:", JSON.stringify(classroomData, null, 2));
//   return classroomData;
// }
// 
// /**
//  * Get students enrolled in a SIS class
//  * @param {string} classId - SIS class ID
//  * @returns {Array} Array of student objects with email addresses
//  */
// function getStudentsForClass(classId) {
//   console.log("[Students] Getting students for class:", classId);
// 
//   try {
//     const token = authenticateWithSIS();
//     const baseUrl = getSISUrl();
//     const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
// 
//     const studentsUrl = `${cleanBaseUrl}/classes/${classId}/students?limit=100&offset=0`;
//     console.log("[Students] Getting students:", studentsUrl);
// 
//     const response = UrlFetchApp.fetch(studentsUrl, {
//       headers: {
//         "Accept": "application/json",
//         "Authorization": `Bearer ${token}`
//       }
//     });
// 
//     if (response.getResponseCode() !== 200) {
//       throw new Error(`Failed to get class students: ${response.getResponseCode()}`);
//     }
// 
//     const data = JSON.parse(response.getContentText());
//     console.log("[Students] Students response:", JSON.stringify(data, null, 2));
// 
//     const students = data.users || [];
// 
//     // Filter to ensure we only have students with email addresses
//     const validStudents = students.filter(user => user && user.email);
// 
//     console.log(`[Students] Found ${validStudents.length} students in class ${classId}`);
//     validStudents.forEach(student => {
//       console.log(`[Students] - ${student.email} (${student.givenName} ${student.familyName})`);
//     });
// 
//     return validStudents;
// 
//   } catch (error) {
//     console.error("[Students] Error getting students for class:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Create a Google Classroom from SIS class data
//  * @param {Object} classroomData - Mapped classroom data from gatherClassroomData()
//  * @returns {Object} Created Google Classroom object
//  */
// function createGoogleClassroom(classroomData) {
//   console.log("[Classroom Creation] Creating Google Classroom:", classroomData.name);
// 
//   try {
//     // Check if we have required data
//     if (!classroomData.name) {
//       throw new Error("Classroom name is required");
//     }
// 
//     if (!classroomData.ownerId) {
//       console.log("[Classroom Creation] WARNING: No teacher email found, using default");
//       classroomData.ownerId = "classrooms@innovationcharter.org"; // Fallback
//     }
// 
//     // Create the classroom
//     const classroom = Classroom.Courses.create({
//       name: classroomData.name,
//       section: classroomData.section || "",
//       description: classroomData.description || "",
//       room: classroomData.room || "",
//       ownerId: classroomData.ownerId,
//       courseState: classroomData.courseState || "PROVISIONED",
//       guardiansEnabled: classroomData.guardiansEnabled !== false
//     });
// 
//     console.log("[Classroom Creation] Successfully created classroom:", classroom.id);
//     console.log("[Classroom Creation] Classroom details:", JSON.stringify(classroom, null, 2));
// 
//     // Log the creation for tracking (simple logging for now)
//     logClassroomCreation(classroomData.sisClassId, classroom.id, classroomData);
// 
//     return classroom;
// 
//   } catch (error) {
//     console.error("[Classroom Creation] Error creating classroom:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Add students to an existing Google Classroom
//  * @param {string} classroomId - Google Classroom ID
//  * @param {string} sisClassId - SIS class ID to get students from
//  * @returns {Object} Results of student additions
//  */
// function addStudentsToClass(classroomId, sisClassId) {
//   console.log("[Student Addition] Adding students to classroom:", classroomId);
// 
//   try {
//     const students = getStudentsForClass(sisClassId);
//     const results = {
//       total: students.length,
//       added: 0,
//       errors: []
//     };
// 
//     for (const student of students) {
//       try {
//         console.log(`[Student Addition] Adding student: ${student.email}`);
// 
//         const result = Classroom.Courses.Students.create({
//           userId: student.email
//         }, classroomId);
// 
//         console.log(`[Student Addition] Successfully added: ${student.email}`);
//         results.added++;
// 
//         // Log the addition
//         logStudentAddition(sisClassId, classroomId, student.email);
// 
//       } catch (error) {
//         console.error(`[Student Addition] Error adding ${student.email}:`, error.message);
//         results.errors.push({
//           email: student.email,
//           error: error.message
//         });
//       }
//     }
// 
//     console.log(`[Student Addition] Completed: ${results.added}/${results.total} students added`);
//     if (results.errors.length > 0) {
//       console.log(`[Student Addition] ${results.errors.length} errors occurred`);
//     }
// 
//     return results;
// 
//   } catch (error) {
//     console.error("[Student Addition] Error adding students to class:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Simple logging function for classroom creation (before full spreadsheet system)
//  * @param {string} sisClassId - SIS class ID
//  * @param {string} classroomId - Google Classroom ID
//  * @param {Object} classroomData - Classroom data used for creation
//  */
// function logClassroomCreation(sisClassId, classroomId, classroomData) {
//   const timestamp = new Date().toISOString();
//   const logEntry = {
//     timestamp: timestamp,
//     action: "CLASSROOM_CREATED",
//     sisClassId: sisClassId,
//     classroomId: classroomId,
//     classroomName: classroomData.name,
//     teacher: classroomData.ownerId
//   };
// 
//   console.log("[Logging] Classroom created:", JSON.stringify(logEntry, null, 2));
// 
//   // For now, just log to console
//   // Later we'll write to spreadsheet tracking system
// }
// 
// /**
//  * Simple logging function for student addition (before full spreadsheet system)
//  * @param {string} sisClassId - SIS class ID
//  * @param {string} classroomId - Google Classroom ID
//  * @param {string} studentEmail - Student email that was added
//  */
// function logStudentAddition(sisClassId, classroomId, studentEmail) {
//   const timestamp = new Date().toISOString();
//   const logEntry = {
//     timestamp: timestamp,
//     action: "STUDENT_ADDED",
//     sisClassId: sisClassId,
//     classroomId: classroomId,
//     studentEmail: studentEmail
//   };
// 
//   console.log("[Logging] Student added:", JSON.stringify(logEntry, null, 2));
// 
//   // For now, just log to console
//   // Later we'll write to spreadsheet tracking system
// }
// 
// // ===== TEST FUNCTIONS FOR CORE API FUNCTIONALITY =====
// 
// /**
//  * Test gathering classroom data for a specific class
//  * Run this to see what data is available for creating Google Classrooms
//  */
// function testGatherClassroomData() {
//   console.log("=== TESTING CLASSROOM DATA GATHERING ===");
// 
//   try {
//     // First get some classes to test with
//     const schools = getInnovationSchools();
//     const hsClasses = getHighSchoolClasses(5); // Get just a few classes for testing
// 
//     if (!hsClasses.classes || hsClasses.classes.length === 0) {
//       throw new Error("No classes found to test with");
//     }
// 
//     // Test with the first class
//     const testClass = hsClasses.classes[0];
//     console.log(`Testing with class: ${testClass.title} (${testClass.sourcedId})`);
// 
//     const classroomData = gatherClassroomData(testClass.sourcedId);
// 
//     console.log("=== CLASSROOM DATA GATHERING SUCCESSFUL ===");
//     console.log("Mapped data for Google Classroom creation:");
//     console.log("- Name:", classroomData.name);
//     console.log("- Section:", classroomData.section);
//     console.log("- Description:", classroomData.description);
//     console.log("- Room:", classroomData.room);
//     console.log("- Owner ID:", classroomData.ownerId);
//     console.log("- SIS Class ID:", classroomData.sisClassId);
// 
//     return classroomData;
// 
//   } catch (error) {
//     console.error("❌ Classroom data gathering failed:", error.message);
//     throw error;
//   }
// }
// 
// // ===== SAFE TESTING FUNCTIONS FOR DEVELOPMENT =====
// 
// /**
//  * TEST FUNCTION: Get classroom creation parameters without creating anything
//  * This is completely safe to run during development - it only prepares data
//  * @param {Object|Function} filter - Filter criteria for classes
//  * @param {Object} params - Additional parameters
//  * @param {Function} converter - Optional converter function
//  * @returns {Array} Array of classroom creation parameters (NO ACTUAL CREATION)
//  */
// function testGetClassroomParams(filter = {}, params = {}, converter = null) {
//   console.log("=== SAFE TEST: Getting Classroom Creation Parameters ===");
//   console.log("This function does NOT create any Google Classrooms");
//   console.log("Filter:", JSON.stringify(filter, null, 2));
//   console.log("Params:", JSON.stringify(params, null, 2));
//   console.log("Has converter:", !!converter);
// 
//   try {
//     // Get parameters for multiple classes (safe - no creation)
//     const paramsArray = getGoogleClassroomCreateParamsMultiple(filter, params, converter);
// 
//     console.log(`\n=== RESULTS: ${paramsArray.length} classes processed ===`);
// 
//     paramsArray.forEach((paramSet, index) => {
//       if (paramSet.success) {
//         console.log(`\n${index + 1}. ${paramSet.sisClass.title} (${paramSet.sisClassId})`);
//         console.log("   Generated classroom params:");
//         console.log("   - Name:", paramSet.classroomParams.name);
//         console.log("   - Section:", paramSet.classroomParams.section);
//         console.log("   - Room:", paramSet.classroomParams.room);
//         console.log("   - Owner:", paramSet.classroomParams.ownerId);
//         console.log("   - Description:", (paramSet.classroomParams.description || "").substring(0, 100) + "...");
//       } else {
//         console.log(`\n${index + 1}. ERROR for ${paramSet.sisClassId}: ${paramSet.error}`);
//       }
//     });
// 
//     console.log("\n=== SUMMARY ===");
//     const successCount = paramsArray.filter(p => p.success).length;
//     console.log(`Successfully generated parameters for ${successCount}/${paramsArray.length} classes`);
//     console.log("To actually create classrooms, use createCourses() with the same parameters");
// 
//     return paramsArray;
// 
//   } catch (error) {
//     console.error("Error in safe parameter test:", error);
//     throw error;
//   }
// }
// 
// /**
//  * TEST FUNCTION: Test a converter function safely
//  * @param {Function} converter - Converter function to test
//  * @param {number} limit - Number of classes to test with (default 3)
//  */
// function testConverterFunction(converter, limit = 3) {
//   console.log("=== SAFE TEST: Testing Converter Function ===");
//   console.log("This function does NOT create any Google Classrooms");
// 
//   try {
//     // Get a few Innovation Academy classes for testing
//     const allClasses = getAllInnovationClasses(limit);
//     const testClasses = [
//       ...allClasses.highSchool.classes.slice(0, Math.ceil(limit / 2)),
//       ...allClasses.middleSchool.classes.slice(0, Math.floor(limit / 2))
//     ];
// 
//     console.log(`\nTesting converter with ${testClasses.length} classes:\n`);
// 
//     testClasses.forEach((sisClass, index) => {
//       try {
//         console.log(`${index + 1}. Testing with: ${sisClass.title} (${sisClass.classCode})`);
// 
//         // Simulate the converter call with minimal SIS data
//         const testSisData = {
//           class: sisClass,
//           course: sisClass.course || null,
//           teacher: null // Would normally be fetched
//         };
// 
//         const result = converter(testSisData);
//         console.log("   Converter result:", JSON.stringify(result, null, 2));
// 
//       } catch (error) {
//         console.error(`   Converter error: ${error.message}`);
//       }
//     });
// 
//     return { success: true, testClasses: testClasses };
// 
//   } catch (error) {
//     console.error("Error testing converter:", error);
//     throw error;
//   }
// }
// 
// /**
//  * EXAMPLE: Test the parameter generation with a sample converter
//  */
// function testParameterGenerationWithConverter() {
//   console.log("=== TESTING PARAMETER GENERATION WITH SAMPLE CONVERTER ===");
// 
//   // Define a sample converter function
//   const sampleConverter = (sisData) => {
//     const cls = sisData.class;
// 
//     // Create custom naming: "Course Title - Section Period"
//     let customName = cls.title || "Untitled Course";
//     if (cls.courseCode && cls.classCode) {
//       customName = `${cls.courseCode}-${cls.classCode}: ${cls.title}`;
//     } else if (cls.classCode) {
//       customName = `${cls.classCode}: ${cls.title}`;
//     } else if (cls.courseCode) {
//       customName = `${cls.courseCode}: ${cls.title}`;
//     }
// 
//     // Add school year if available
//     if (cls.schoolYearTitle) {
//       const shortYear = extractShortSchoolYear(cls.schoolYearTitle);
//       if (shortYear) {
//         customName += ` (${shortYear})`;
//       }
//     }
// 
//     // Custom section naming with term info
//     let customSection = "";
//     if (cls.periods && cls.periods.length > 0) {
//       customSection = `Period ${cls.periods.join(", ")}`;
//     }
// 
//     // Add term info to section
//     if (cls.termCodes && cls.termCodes.length > 0) {
//       const termInfo = cls.termCodes.join(", ");
//       customSection = customSection ? `${customSection} - ${termInfo}` : termInfo;
//     }
// 
//     // Enhanced description with academic info
//     let description = `Custom description for ${cls.title}.`;
//     if (cls.schoolYearTitle) {
//       description += `\nSchool Year: ${cls.schoolYearTitle}`;
//     }
//     if (cls.termTitles && cls.termTitles.length > 0) {
//       description += `\nTerms: ${cls.termTitles.join(", ")}`;
//     }
//     description += `\nSIS ID: ${cls.sourcedId}`;
// 
//     return {
//       name: customName,
//       section: customSection,
//       description: description
//     };
//   };
// 
//   // Test the converter first
//   console.log("\n1. Testing converter function:");
//   testConverterFunction(sampleConverter, 2);
// 
//   // Test parameter generation with Innovation Academy HS classes
//   console.log("\n2. Testing parameter generation:");
//   const filter = {
//     schools: ["SKL0000000900b"], // Innovation Academy HS
//     limit: 3
//   };
// 
//   const params = {
//     courseState: "DRAFT", // Safe: creates in draft mode
//     guardiansEnabled: false
//   };
// 
//   return testGetClassroomParams(filter, params, sampleConverter);
// }
// 
// /**
//  * TEST FUNCTION: Test academic data caching and enhancement
//  * This is completely safe - only tests data retrieval and caching
//  */
// function testAcademicDataCaching() {
//   console.log("=== TESTING ACADEMIC DATA CACHING ===");
//   console.log("This function tests the new caching system for academic sessions and terms");
// 
//   try {
//     // Clear cache to start fresh
//     clearSISCache();
// 
//     // Get a sample class to test with
//     const allClasses = getAllInnovationClasses(3);
//     const testClasses = [
//       ...allClasses.highSchool.classes.slice(0, 2),
//       ...allClasses.middleSchool.classes.slice(0, 1)
//     ];
// 
//     console.log(`\nTesting with ${testClasses.length} classes:\n`);
// 
//     testClasses.forEach((sisClass, index) => {
//       console.log(`${index + 1}. Testing class: ${sisClass.title} (${sisClass.sourcedId})`);
// 
//       // Show original SIS data
//       console.log("   Original SIS data:");
//       if (sisClass.schoolYear) {
//         console.log(`   - School Year Reference: ${sisClass.schoolYear.sourcedId}`);
//       }
//       if (sisClass.terms && sisClass.terms.length > 0) {
//         console.log(`   - Term References: ${sisClass.terms.map(t => t.sourcedId).join(", ")}`);
//       }
// 
//       // Test the enhancement (this will cache the academic data)
//       try {
//         const token = authenticateWithSIS();
//         const baseUrl = getSISUrl();
//         const enhanced = enhanceClassWithAcademicData(sisClass, token, baseUrl);
// 
//         console.log("   Enhanced data:");
//         if (enhanced.schoolYearTitle) {
//           console.log(`   - School Year: ${enhanced.schoolYearTitle}`);
//           console.log(`   - Short Year: ${extractShortSchoolYear(enhanced.schoolYearTitle)}`);
//         }
//         if (enhanced.termTitles && enhanced.termTitles.length > 0) {
//           console.log(`   - Term Titles: ${enhanced.termTitles.join(", ")}`);
//         }
//         if (enhanced.termCodes && enhanced.termCodes.length > 0) {
//           console.log(`   - Term Codes: ${enhanced.termCodes.join(", ")}`);
//         }
// 
//       } catch (error) {
//         console.error(`   Error enhancing class: ${error.message}`);
//       }
// 
//       console.log(""); // Empty line for readability
//     });
// 
//     console.log("=== CACHE STATUS ===");
//     console.log(`Academic sessions cached: ${SIS_CACHE.academicSessions.size}`);
//     console.log(`Terms cached: ${SIS_CACHE.terms.size}`);
// 
//     // Show what's in the cache
//     if (SIS_CACHE.academicSessions.size > 0) {
//       console.log("\nCached academic sessions:");
//       SIS_CACHE.academicSessions.forEach((session, id) => {
//         console.log(`- ${id}: ${session.title || session.schoolYear || 'no title'}`);
//       });
//     }
// 
//     if (SIS_CACHE.terms.size > 0) {
//       console.log("\nCached terms:");
//       SIS_CACHE.terms.forEach((term, id) => {
//         console.log(`- ${id}: ${term.title || 'no title'}`);
//       });
//     }
// 
//     return {
//       success: true,
//       message: "Academic data caching test completed",
//       academicSessionsCached: SIS_CACHE.academicSessions.size,
//       termsCached: SIS_CACHE.terms.size
//     };
// 
//   } catch (error) {
//     console.error("Error in academic data caching test:", error);
//     throw error;
//   }
// }
// 
// /**
//  * Test creating a sample Google Classroom
//  * WARNING: This will actually create a classroom!
//  */
// function testCreateSampleClassroom() {
//   console.log("=== TESTING GOOGLE CLASSROOM CREATION ===");
//   console.log("WARNING: This will create an actual Google Classroom!");
// 
//   try {
//     // First gather classroom data
//     const classroomData = testGatherClassroomData();
// 
//     // Add test prefix to name to identify test classrooms
//     classroomData.name = `[TEST] ${classroomData.name}`;
//     classroomData.courseState = "PROVISIONED"; // Keep as draft initially
// 
//     console.log("Creating test classroom with data:", classroomData);
// 
//     const classroom = createGoogleClassroom(classroomData);
// 
//     console.log("=== CLASSROOM CREATION SUCCESSFUL ===");
//     console.log("Created classroom ID:", classroom.id);
//     console.log("Classroom URL:", `https://classroom.google.com/c/${classroom.id}`);
// 
//     return {
//       classroomData: classroomData,
//       classroom: classroom
//     };
// 
//   } catch (error) {
//     console.error("❌ Classroom creation failed:", error.message);
//     throw error;
//   }
// }
// 
// /**
//  * Test getting students for a class
//  */
// function testGetStudentsForClass() {
//   console.log("=== TESTING STUDENT DATA RETRIEVAL ===");
// 
//   try {
//     // Get a test class
//     const schools = getInnovationSchools();
//     const hsClasses = getHighSchoolClasses(5);
// 
//     if (!hsClasses.classes || hsClasses.classes.length === 0) {
//       throw new Error("No classes found to test with");
//     }
// 
//     const testClass = hsClasses.classes[0];
//     console.log(`Testing with class: ${testClass.title} (${testClass.sourcedId})`);
// 
//     const students = getStudentsForClass(testClass.sourcedId);
// 
//     console.log("=== STUDENT DATA RETRIEVAL SUCCESSFUL ===");
//     console.log(`Found ${students.length} students`);
// 
//     return students;
// 
//   } catch (error) {
//     console.error("❌ Student data retrieval failed:", error.message);
//     throw error;
//   }
// }
// 
// /**
//  * Complete end-to-end test: gather data, create classroom, add students
//  * WARNING: This will create an actual Google Classroom and add students!
//  */
// function testCompleteClassroomWorkflow() {
//   console.log("=== TESTING COMPLETE CLASSROOM WORKFLOW ===");
//   console.log("WARNING: This will create an actual Google Classroom and add students!");
// 
//   try {
//     // Step 1: Gather classroom data
//     console.log("\n1. Gathering classroom data...");
//     const classroomData = testGatherClassroomData();
// 
//     // Step 2: Create classroom
//     console.log("\n2. Creating Google Classroom...");
//     classroomData.name = `[FULL TEST] ${classroomData.name}`;
//     const classroom = createGoogleClassroom(classroomData);
// 
//     // Step 3: Add students
//     console.log("\n3. Adding students to classroom...");
//     const studentResults = addStudentsToClass(classroom.id, classroomData.sisClassId);
// 
//     console.log("=== COMPLETE WORKFLOW SUCCESSFUL ===");
//     console.log("Classroom ID:", classroom.id);
//     console.log("Students added:", `${studentResults.added}/${studentResults.total}`);
//     console.log("Classroom URL:", `https://classroom.google.com/c/${classroom.id}`);
// 
//     return {
//       classroomData: classroomData,
//       classroom: classroom,
//       studentResults: studentResults
//     };
// 
//   } catch (error) {
//     console.error("❌ Complete workflow failed:", error.message);
//     throw error;
//   }
// }
// 
// // ===== TEST FUNCTIONS FOR NEW FLEXIBLE API =====
// 
// /**
//  * Test the new createCourse function with custom converter
//  */
// function testCreateCourseWithConverter() {
//   console.log("=== TESTING NEW CREATE COURSE API ===");
//   console.log("WARNING: This will create an actual Google Classroom!");
// 
//   try {
//     // Get a sample class
//     const schools = getInnovationSchools();
//     const hsClasses = getHighSchoolClasses(3);
// 
//     if (!hsClasses.classes || hsClasses.classes.length === 0) {
//       throw new Error("No classes found to test with");
//     }
// 
//     const testClass = hsClasses.classes[0];
//     console.log(`Testing with class: ${testClass.title} (${testClass.sourcedId})`);
// 
//     // Define a custom converter function
//     const myConverter = (sisData) => {
//       const cls = sisData.class;
//       const course = sisData.course;
// 
//       // Custom naming scheme
//       let customName = cls.title;
//       if (cls.classCode) {
//         customName = `${cls.classCode} - ${cls.title}`;
//       }
//       if (course && course.courseCode) {
//         customName = `${course.courseCode} - ${cls.title}`;
//       }
// 
//       return {
//         name: `[NEW API TEST] ${customName}`,
//         description: `Custom description for ${cls.title}\nGenerated by new flexible API\nSIS Class: ${cls.sourcedId}`,
//         courseState: "PROVISIONED" // Keep as draft
//       };
//     };
// 
//     // Create course with converter
//     const classroom = createCourse(
//       testClass.sourcedId,
//       { guardiansEnabled: true },
//       myConverter
//     );
// 
//     console.log("=== NEW API TEST SUCCESSFUL ===");
//     console.log("Created classroom ID:", classroom.id);
//     console.log("Classroom URL:", `https://classroom.google.com/c/${classroom.id}`);
// 
//     return classroom;
// 
//   } catch (error) {
//     console.error("❌ New API test failed:", error.message);
//     throw error;
//   }
// }
// 
// /**
//  * Test the new createCourses function with filtering
//  */
// function testCreateCoursesWithFilter() {
//   console.log("=== TESTING BULK COURSE CREATION ===");
//   console.log("WARNING: This will create multiple actual Google Classrooms!");
// 
//   try {
//     // Define filter for PE classes only
//     const filter = {
//       subjects: ["PE"], // Only Physical Education classes
//       customFilter: (cls) => {
//         // Additional custom filtering - exclude if title contains certain words
//         const excludeWords = ["lunch", "study hall", "homeroom"];
//         const title = cls.title ? cls.title.toLowerCase() : "";
//         return !excludeWords.some(word => title.includes(word));
//       }
//     };
// 
//     // Define converter for consistent naming
//     const peConverter = (sisData) => {
//       const cls = sisData.class;
//       return {
//         name: `[BULK TEST] PE - ${cls.title}`,
//         description: `Physical Education Class\nPeriods: ${cls.periods ? cls.periods.join(", ") : "TBD"}\nLocation: ${cls.location || "TBD"}`,
//         courseState: "PROVISIONED",
//         guardiansEnabled: true
//       };
//     };
// 
//     // Create courses
//     const results = createCourses(filter, {}, peConverter);
// 
//     console.log("=== BULK CREATION RESULTS ===");
//     console.log(`Total processed: ${results.length}`);
//     console.log(`Successful: ${results.filter(r => r.success).length}`);
//     console.log(`Failed: ${results.filter(r => !r.success).length}`);
// 
//     results.forEach(result => {
//       if (result.success) {
//         console.log(`✅ Created: ${result.classroom.name} (ID: ${result.classroomId})`);
//       } else {
//         console.log(`❌ Failed: ${result.sisClass.title} - ${result.error}`);
//       }
//     });
// 
//     return results;
// 
//   } catch (error) {
//     console.error("❌ Bulk creation test failed:", error.message);
//     throw error;
//   }
// }
// 
// /**
//  * Test filtering without creating courses
//  */
// function testCourseFiltering() {
//   console.log("=== TESTING COURSE FILTERING ===");
// 
//   try {
//     // Test different filter combinations
//     const filters = [
//       { description: "All classes", filter: {} },
//       { description: "PE classes only", filter: { subjects: ["PE"] } },
//       { description: "Math classes only", filter: { subjects: ["Math", "Mathematics"] } },
//       { description: "Custom filter (no lunch)", filter: { customFilter: (cls) => !cls.title.toLowerCase().includes("lunch") } }
//     ];
// 
//     filters.forEach(({ description, filter }) => {
//       console.log(`\n--- ${description} ---`);
//       const classes = getSISClassesWithFilter(filter);
//       console.log(`Found ${classes.length} classes`);
//       classes.slice(0, 3).forEach(cls => {
//         console.log(`- ${cls.title} (${cls.subjects ? cls.subjects.join(", ") : "no subjects"})`);
//       });
//       if (classes.length > 3) {
//         console.log(`... and ${classes.length - 3} more`);
//       }
//     });
// 
//     return { success: true, message: "Filtering test completed" };
// 
//   } catch (error) {
//     console.error("❌ Filtering test failed:", error.message);
//     throw error;
//   }
// }
// 
// // ===== END OF ARCHIVED AspenSync.gs.js FILE =====
// */
