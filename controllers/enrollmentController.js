import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

// Get enrollments
export async function getEnrollments(req, res) {
  try {
    const filter = {};

    // Students can only view their own enrollments.
    if (req.user.role === "student") {
      filter.student = req.user._id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const enrollments = await Enrollment.find(filter)
      .populate("student", "firstName lastName email studentId program yearLevel")
      .populate("course", "courseCode courseName units instructor semester schoolYear")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    console.error("Get enrollments error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve enrollments.",
    });
  }
}

// Get one enrollment
export async function getEnrollmentById(req, res) {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("student", "firstName lastName email studentId program yearLevel")
      .populate("course", "courseCode courseName units instructor semester schoolYear");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    // Students can only access their own enrollment.
    if (
      req.user.role === "student" &&
      enrollment.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot access another student's enrollment.",
      });
    }

    return res.status(200).json({
      success: true,
      enrollment,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment ID.",
      });
    }

    console.error("Get enrollment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve enrollment.",
    });
  }
}

// Enroll the logged-in student in an active course
export async function createEnrollment(req, res) {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required.",
      });
    }

    const course = await Course.findOne({
      _id: courseId,
      isActive: true,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Active course not found.",
      });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: course._id,
      status: "Enrolled",
      grade: null,
    });

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate("student", "firstName lastName email studentId program yearLevel")
      .populate("course", "courseCode courseName units instructor semester schoolYear");

    return res.status(201).json({
      success: true,
      message: "Student enrolled successfully.",
      enrollment: populatedEnrollment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "The student is already enrolled in this course.",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create enrollment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to enroll student.",
    });
  }
}

// Update enrollment status or grade (admin only)
export async function updateEnrollment(req, res) {
  try {
    const updates = {};
    const allowedFields = ["status", "grade", "remarks"];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide a status, grade, or remarks to update.",
      });
    }

    if (
      updates.status !== undefined &&
      !["Enrolled", "Completed", "Dropped"].includes(updates.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment status.",
      });
    }

    if (updates.grade !== undefined && updates.grade !== null) {
      const grade = Number(updates.grade);

      if (!Number.isFinite(grade) || grade < 0 || grade > 100) {
        return res.status(400).json({
          success: false,
          message: "Grade must be between 0 and 100.",
        });
      }

      updates.grade = grade;
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("student", "firstName lastName email studentId program yearLevel")
      .populate("course", "courseCode courseName units instructor semester schoolYear");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enrollment updated successfully.",
      enrollment,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment ID.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update enrollment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update enrollment.",
    });
  }
}

// Delete an enrollment (admin only)
export async function deleteEnrollment(req, res) {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enrollment deleted successfully.",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment ID.",
      });
    }

    console.error("Delete enrollment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete enrollment.",
    });
  }
}