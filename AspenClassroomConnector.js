/* global logOperation, authenticateWithSIS, getSISUrl, enhanceClassWithAcademicData, getSISClassesForSchool, getAllInnovationClasses, UrlFetchApp, Classroom */
// ===== ASPEN TO GOOGLE CLASSROOM CONNECTOR =====
// Main API for creating Google Classrooms from SIS data with flexible converters

/**
 * Get Google Classroom creation parameters for a single SIS class
 * @param {string|Object} aspenId - SIS class ID or pre-fetched classroomData from gatherClassroomData
 * @param {Object} params - Additional parameters for classroom creation
 * @param {Function} converter - Optional converter function: (sisData) => googleParamsPartial
 * @returns {Object} Google Classroom creation parameters
 */
function getGoogleClassroomCreateParams(
  aspenId,
  params = {},
  converter = null
) {
  try {
    // Get the complete SIS data
    const classroomData = gatherClassroomData(aspenId);

    // Apply converter if provided
    let convertedData = {};
    if (converter && typeof converter === "function") {
      const sisData = {
        class: classroomData.sisClass,
        course: classroomData.sisCourse,
        teacher: classroomData.sisTeacher,
      };
      convertedData = converter(sisData) || {};
      logOperation(
        "AspenClassroomConnector",
        "getGoogleClassroomCreateParams",
        "converted params"
      );
    }

    // Merge data: base mapping < converter results < explicit params
    const finalClassroomData = {
      ...classroomData,
      ...convertedData,
      ...params,
    };
    logOperation(
      "AspenClassroomConnector",
      "getGoogleClassroomCreateParams",
      "merged id=" + aspenId
    );

    return finalClassroomData;
  } catch (error) {
    throw error;
  }
}

/**
 * Get Google Classroom creation parameters for multiple SIS classes
 * @param {Object|Function} filter - Filter criteria or function
 * @param {Object} params - Additional parameters for classroom creation
 * @param {Function} converter - Optional converter function
 * @returns {Array} Array of classroom creation parameters
 */
function getGoogleClassroomCreateParamsMultiple(
  filter = {},
  params = {},
  converter = null
) {
  try {
    logOperation("AspenClassroomConnector", "getGoogleClassroomCreateParamsMultiple", "start");
    // Get SIS classes based on filter
    const classes = getSISClassesWithFilter(filter);
    logOperation("AspenClassroomConnector", "getGoogleClassroomCreateParamsMultiple", `classes=${classes.length}`);
    const results = [];

    for (const sisClass of classes) {
      try {
        logOperation("AspenClassroomConnector", "getGoogleClassroomCreateParamsMultiple", `single start id=${sisClass.sourcedId}`);
        const classroomParams = getGoogleClassroomCreateParams(
          sisClass.sourcedId,
          params,
          converter
        );
        results.push({
          success: true,
          sisClassId: sisClass.sourcedId,
          sisClass: sisClass,
          classroomParams: classroomParams,
        });
        logOperation("AspenClassroomConnector", "getGoogleClassroomCreateParamsMultiple", `single done id=${sisClass.sourcedId}`);
      } catch (error) {
        results.push({
          success: false,
          sisClassId: sisClass.sourcedId,
          sisClass: sisClass,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    throw error;
  }
}

/**
 * Create a single Google Classroom from SIS class data
 * @param {string} aspenId - SIS class ID
 * @param {Object} params - Additional parameters for classroom creation
 * @param {Function} converter - Optional converter function
 * @returns {Object} Created Google Classroom object
 */
function createCourse(aspenId, params = {}, converter = null) {
  try {
    logOperation("AspenClassroomConnector", "createCourse", `start id=${aspenId}`);
    // Get the classroom creation parameters
    const classroomParams = getGoogleClassroomCreateParams(
      aspenId,
      params,
      converter
    );

    // Create the classroom
    const classroom = createGoogleClassroom(classroomParams);
    logOperation("AspenClassroomConnector", "createCourse", `created id=${aspenId}`);

    return classroom;
  } catch (error) {
    throw error;
  }
}

/**
 * Create multiple Google Classrooms from SIS data
 * @param {Object|Function} filter - Filter criteria or function
 * @param {Object} params - Additional parameters for classroom creation
 * @param {Function} converter - Optional converter function
 * @returns {Array} Array of creation results
 */
function createCourses(filter = {}, params = {}, converter = null) {
  try {
    logOperation("AspenClassroomConnector", "createCourses", "start");
    // Get all the classroom creation parameters first
    const classroomParamsArray = getGoogleClassroomCreateParamsMultiple(
      filter,
      params,
      converter
    );
    const results = [];

    for (const paramSet of classroomParamsArray) {
      if (!paramSet.success) {
        results.push(paramSet);
        continue;
      }

      try {
        const classroom = createGoogleClassroom(paramSet.classroomParams);
        results.push({
          success: true,
          sisClassId: paramSet.sisClassId,
          sisClass: paramSet.sisClass,
          classroomId: classroom.id,
          classroom: classroom,
        });
      } catch (error) {
        results.push({
          success: false,
          sisClassId: paramSet.sisClassId,
          sisClass: paramSet.sisClass,
          error: error.message,
        });
      }
    }

    logOperation("AspenClassroomConnector", "createCourses", `done count=${results.length}`);
    return results;
  } catch (error) {
    throw error;
  }
}

/**
 * Get SIS classes with filtering support
 * @param {Object|Function} filter - Filter criteria or custom filter function
 * @returns {Array} Filtered array of SIS classes
 */
function getSISClassesWithFilter(filter = {}) {
  try {
    logOperation("AspenClassroomConnector", "getSISClassesWithFilter", "start");
    let allClasses = [];

    // If filter specifies schools, get classes for those schools
    if (filter.schools) {
      for (const schoolId of filter.schools) {
        const schoolClasses = getSISClassesForSchool(
          schoolId,
          filter.limit || 100
        );
        allClasses = allClasses.concat(schoolClasses.classes || []);
      }
      logOperation("AspenClassroomConnector", "getSISClassesWithFilter", `schools fetched=${(filter.schools || []).length}, count=${allClasses.length}`);
    } else {
      // Default to Innovation Academy schools
      const innovationClasses = getAllInnovationClasses(filter.limit || 100);
      allClasses = [
        ...innovationClasses.highSchool.classes,
        ...innovationClasses.middleSchool.classes,
      ];
      logOperation("AspenClassroomConnector", "getSISClassesWithFilter", `innovation fetched count=${allClasses.length}`);
    }

    // Apply built-in filters
    let filteredClasses = allClasses;

    // Filter by school year
    if (filter.schoolYear) {
      filteredClasses = filteredClasses.filter((cls) => {
        if (cls.schoolYear && cls.schoolYear.title) {
          return cls.schoolYear.title.includes(filter.schoolYear);
        }
        if (
          cls.course &&
          cls.course.schoolYear &&
          cls.course.schoolYear.title
        ) {
          return cls.course.schoolYear.title.includes(filter.schoolYear);
        }
        return false;
      });
      logOperation("AspenClassroomConnector", "getSISClassesWithFilter", `filter schoolYear -> ${filteredClasses.length}`);
    }

    // Filter by term
    if (filter.term) {
      filteredClasses = filteredClasses.filter((cls) => {
        if (cls.terms && Array.isArray(cls.terms)) {
          return cls.terms.some(
            (term) => term.title && term.title.includes(filter.term)
          );
        }
        return false;
      });
      logOperation("AspenClassroomConnector", "getSISClassesWithFilter", `filter term -> ${filteredClasses.length}`);
    }

    // Filter by subject
    if (filter.subjects) {
      const subjectsArray = Array.isArray(filter.subjects)
        ? filter.subjects
        : [filter.subjects];
      filteredClasses = filteredClasses.filter((cls) => {
        if (cls.subjects && Array.isArray(cls.subjects)) {
          return cls.subjects.some((subject) =>
            subjectsArray.some((filterSubject) =>
              subject.toLowerCase().includes(filterSubject.toLowerCase())
            )
          );
        }
        return false;
      });
      logOperation("AspenClassroomConnector", "getSISClassesWithFilter", `filter subjects -> ${filteredClasses.length}`);
    }

    // Apply custom filter function if provided
    if (typeof filter === "function") {
      filteredClasses = allClasses.filter(filter);
      logOperation("AspenClassroomConnector", "getSISClassesWithFilter", `custom fn -> ${filteredClasses.length}`);
    } else if (
      filter.customFilter &&
      typeof filter.customFilter === "function"
    ) {
      filteredClasses = filteredClasses.filter(filter.customFilter);
      logOperation("AspenClassroomConnector", "getSISClassesWithFilter", `custom prop -> ${filteredClasses.length}`);
    }

    logOperation("AspenClassroomConnector", "getSISClassesWithFilter", `done count=${filteredClasses.length}`);
    return filteredClasses;
  } catch (error) {
    throw error;
  }
}

/**
 * Get detailed class information from SIS with all data needed for Google Classroom creation
 * @param {string} classId - SIS class ID to gather data for
 * @returns {Object} Complete class data mapped for Google Classroom creation
 */
function gatherClassroomData(classId) {
  try {
    logOperation("AspenClassroomConnector", "gatherClassroomData", `start id=${classId}`);
    const token = authenticateWithSIS();
    const baseUrl = getSISUrl();
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");

    // Get class details
    const classUrl = `${cleanBaseUrl}/classes/${classId}`;
    const classResponse = UrlFetchApp.fetch(classUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (classResponse.getResponseCode() !== 200) {
      throw new Error(
        `Failed to get class details: ${classResponse.getResponseCode()}`
      );
    }

    const classData = JSON.parse(classResponse.getContentText());
    const sisClass = classData.class || classData;
    logOperation("AspenClassroomConnector", "gatherClassroomData", `class ok id=${classId}`);

    // Get course details if available
    let courseData = null;
    if (sisClass.course && sisClass.course.sourcedId) {
      const courseUrl = `${cleanBaseUrl}/courses/${sisClass.course.sourcedId}`;
      try {
        const courseResponse = UrlFetchApp.fetch(courseUrl, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (courseResponse.getResponseCode() === 200) {
          const courseResponseData = JSON.parse(
            courseResponse.getContentText()
          );
          courseData = courseResponseData.course || courseResponseData;
          // Attach course data to class for enhancement
          sisClass.course = courseData;
        }
        logOperation("AspenClassroomConnector", "gatherClassroomData", `course ok id=${classId}`);
      } catch (error) {
        // Course fetch failed - continue without course data
      }
    }

    // Enhance class with academic data (cached)
    const enhancedClass = enhanceClassWithAcademicData(
      sisClass,
      token,
      baseUrl
    );
    logOperation("AspenClassroomConnector", "gatherClassroomData", `enhanced id=${classId}`);

    // Get teacher information
    let teacherData = null;
    const teachersUrl = `${cleanBaseUrl}/classes/${classId}/teachers`;
    try {
      const teachersResponse = UrlFetchApp.fetch(teachersUrl, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (teachersResponse.getResponseCode() === 200) {
        const teachersResponseData = JSON.parse(
          teachersResponse.getContentText()
        );
        const teachers = teachersResponseData.users || [];

        // Find primary teacher or just take the first one
        const primaryTeacher = teachers.find(
          (teacher) => teacher.role === "primary" || teacher.role === "teacher"
        );

        if (primaryTeacher) {
          teacherData = primaryTeacher;
        } else if (teachers.length > 0) {
          teacherData = teachers[0];
        }
      }
      logOperation("AspenClassroomConnector", "gatherClassroomData", `teacher ok id=${classId}`);
    } catch (error) {
      // Teacher fetch failed - continue without teacher data
    }

    // Map SIS data to Google Classroom format
    const classroomData = mapSISToGoogleClassroom(
      enhancedClass,
      courseData,
      teacherData
    );

    // Add raw SIS data for converter access
    classroomData.sisClass = enhancedClass;
    classroomData.sisCourse = courseData;
    classroomData.sisTeacher = teacherData;
    logOperation("AspenClassroomConnector", "gatherClassroomData", `mapped id=${classId}`);

    return classroomData;
  } catch (error) {
    throw error;
  }
}

/**
 * Map SIS class data to Google Classroom creation format
 * @param {Object} sisClass - SIS class data
 * @param {Object} courseData - SIS course data (optional)
 * @param {Object} teacherData - SIS teacher data (optional)
 * @returns {Object} Google Classroom creation object
 */
function mapSISToGoogleClassroom(sisClass, courseData, teacherData) {
  // Build classroom name
  let name = sisClass.title || sisClass.name || "Untitled Class";

  // Add course code if available
  if (sisClass.classCode) {
    name = `${sisClass.classCode} - ${name}`;
  } else if (courseData && courseData.courseCode) {
    name = `${courseData.courseCode} - ${name}`;
  }

  // Build section name
  let section = sisClass.period || "";
  if (sisClass.periods && Array.isArray(sisClass.periods)) {
    section = sisClass.periods.join(", ");
  }
  if (sisClass.location) {
    section = section ? `${section} (${sisClass.location})` : sisClass.location;
  }

  // Build description
  let description = "";
  if (courseData && courseData.title) {
    description += `Course: ${courseData.title}\n`;
  }
  if (sisClass.periods) {
    description += `Period(s): ${sisClass.periods.join(", ")}\n`;
  }
  if (sisClass.terms && sisClass.terms.length > 0) {
    description += `Terms: ${sisClass.terms
      .map((t) => t.sourcedId)
      .join(", ")}\n`;
  }
  description += `SIS Class ID: ${sisClass.sourcedId}`;

  // Determine room
  let room = sisClass.location || sisClass.room || "";

  // Determine owner (teacher email)
  let ownerId = null;
  if (teacherData && teacherData.email) {
    ownerId = teacherData.email;
  }

  return {
    name: name,
    section: section,
    description: description,
    room: room,
    ownerId: ownerId,
    courseState: "PROVISIONED",
    guardiansEnabled: true,
    sisClassId: sisClass.sourcedId,
    sisCourseId: courseData ? courseData.sourcedId : null,
    sisTeacherId: teacherData ? teacherData.sourcedId : null,
  };
}

/**
 * Create a Google Classroom from prepared classroom data
 * @param {Object} classroomData - Mapped classroom data
 * @returns {Object} Created Google Classroom object
 */
function createGoogleClassroom(classroomData) {
  try {
    // Check if we have required data
    if (!classroomData.name) {
      throw new Error("Classroom name is required");
    }

    if (!classroomData.ownerId) {
      throw new Error("Teacher email (ownerId) is required");
    }

    // Create the classroom
    const classroom = Classroom.Courses.create({
      name: classroomData.name,
      section: classroomData.section || "",
      description: classroomData.description || "",
      room: classroomData.room || "",
      ownerId: classroomData.ownerId,
      courseState: classroomData.courseState || "PROVISIONED",
      guardiansEnabled: classroomData.guardiansEnabled !== false,
    });

    return classroom;
  } catch (error) {
    throw error;
  }
}

/**
 * Add students to an existing Google Classroom
 * @param {string} classroomId - Google Classroom ID
 * @param {string} sisClassId - SIS class ID to get students from
 * @returns {Object} Results of student additions
 */
function addStudentsToClass(classroomId, sisClassId) {
  try {
    const students = getStudentsForClass(sisClassId);
    const results = {
      total: students.length,
      added: 0,
      errors: [],
    };

    for (const student of students) {
      try {
        Classroom.Courses.Students.create(
          {
            userId: student.email,
          },
          classroomId
        );

        results.added++;
      } catch (error) {
        results.errors.push({
          email: student.email,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    throw error;
  }
}
