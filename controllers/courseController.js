import Course from "../models/Course.js";

// Get all courses
export async function getCourses(req, res) {
  try {
    const filter = {};

    // Students only see courses that are currently active.
    if (req.user.role === "student") {
      filter.isActive = true;
    }

    if (req.query.semester) {
      filter.semester = req.query.semester;
    }

    if (req.query.schoolYear) {
      filter.schoolYear = req.query.schoolYear;
    }

    if (req.query.search) {
      const search = req.query.search.trim();

      if (search) {
        filter.$or = [
          { courseCode: { $regex: search, $options: "i" } },
          { courseName: { $regex: search, $options: "i" } },
          { instructor: { $regex: search, $options: "i" } },
        ];
      }
    }

    const courses = await Course.find(filter).sort({
      courseCode: 1,
    });

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Get courses error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve courses.",
    });
  }
}

// Get one course
export async function getCourseById(req, res) {
  try {
    const filter = { _id: req.params.id };

    if (req.user.role === "student") {
      filter.isActive = true;
    }

    const course = await Course.findOne(filter);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID.",
      });
    }

    console.error("Get course error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve course.",
    });
  }
}

// Create a course (admin only)
export async function createCourse(req, res) {
  try {
    const {
      courseCode,
      courseName,
      description,
      units,
      instructor,
      semester,
      schoolYear,
    } = req.body;

    if (
      typeof courseCode !== "string" ||
      !courseCode.trim() ||
      typeof courseName !== "string" ||
      !courseName.trim() ||
      units === undefined ||
      units === null ||
      units === "" ||
      !semester ||
      typeof schoolYear !== "string" ||
      !schoolYear.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Course code, course name, units, semester, and school year are required.",
      });
    }

    const course = await Course.create({
      courseCode: courseCode.trim(),
      courseName: courseName.trim(),
      description,
      units: Number(units),
      instructor,
      semester,
      schoolYear: schoolYear.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully.",
      course,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A course with this course code already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create course error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create course.",
    });
  }
}

// Update a course (admin only)
export async function updateCourse(req, res) {
  try {
    const allowedFields = [
      "courseCode",
      "courseName",
      "description",
      "units",
      "instructor",
      "semester",
      "schoolYear",
      "isActive",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.courseCode !== undefined) {
      if (
        typeof updates.courseCode !== "string" ||
        !updates.courseCode.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Course code cannot be empty.",
        });
      }

      updates.courseCode = updates.courseCode.trim();
    }

    if (updates.courseName !== undefined) {
      if (
        typeof updates.courseName !== "string" ||
        !updates.courseName.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Course name cannot be empty.",
        });
      }

      updates.courseName = updates.courseName.trim();
    }

    if (updates.schoolYear !== undefined) {
      if (
        typeof updates.schoolYear !== "string" ||
        !updates.schoolYear.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "School year cannot be empty.",
        });
      }

      updates.schoolYear = updates.schoolYear.trim();
    }

    if (updates.units !== undefined) {
      const units = Number(updates.units);

      if (!Number.isInteger(units) || units < 1 || units > 12) {
        return res.status(400).json({
          success: false,
          message: "Units must be a whole number from 1 to 12.",
        });
      }

      updates.units = units;
    }

    if (
      updates.isActive !== undefined &&
      typeof updates.isActive !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully.",
      course,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID.",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A course with this course code already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update course error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update course.",
    });
  }
}

// Delete a course (admin only)
export async function deleteCourse(req, res) {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully.",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID.",
      });
    }

    console.error("Delete course error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete course.",
    });
  }
}