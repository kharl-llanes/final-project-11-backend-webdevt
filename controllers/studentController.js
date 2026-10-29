import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Get all student accounts (admin only)
export async function getStudents(req, res) {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ lastName: 1, firstName: 1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get students error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve students.",
    });
  }
}

// Get the currently logged-in user's profile
export async function getMyProfile(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
}

// Get one student by ID (admin only)
export async function getStudentById(req, res) {
  try {
    const student = await User.findOne({
      _id: req.params.id,
      role: "student",
    }).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    console.error("Get student error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve student.",
    });
  }
}

// Create a student account (admin only)
export async function createStudent(req, res) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      studentId,
      program,
      yearLevel,
    } = req.body;

    if (
      typeof firstName !== "string" ||
      !firstName.trim() ||
      typeof lastName !== "string" ||
      !lastName.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid first name, last name, email, and password of at least 8 characters are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        ...(studentId?.trim() ? [{ studentId: studentId.trim() }] : []),
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "The email or student ID is already in use.",
      });
    }

    const student = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      studentId: studentId?.trim() || undefined,
      program: typeof program === "string" ? program.trim() : "",
      yearLevel:
        yearLevel === "" || yearLevel == null ? null : Number(yearLevel),
      role: "student",
    });

    const studentResponse = student.toObject();
    delete studentResponse.password;

    return res.status(201).json({
      success: true,
      message: "Student created successfully.",
      student: studentResponse,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "The email or student ID is already in use.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create student error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create student.",
    });
  }
}

// Update a student account (admin only)
export async function updateStudent(req, res) {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "studentId",
      "program",
      "yearLevel",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.firstName !== undefined) {
      if (
        typeof updates.firstName !== "string" ||
        !updates.firstName.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "First name cannot be empty.",
        });
      }

      updates.firstName = updates.firstName.trim();
    }

    if (updates.lastName !== undefined) {
      if (
        typeof updates.lastName !== "string" ||
        !updates.lastName.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Last name cannot be empty.",
        });
      }

      updates.lastName = updates.lastName.trim();
    }

    if (updates.email !== undefined) {
      if (
        typeof updates.email !== "string" ||
        !updates.email.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "A valid email is required.",
        });
      }

      updates.email = updates.email.trim().toLowerCase();
    }

    if (updates.studentId !== undefined) {
      if (typeof updates.studentId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Student ID must be text.",
        });
      }

      updates.studentId = updates.studentId.trim() || undefined;
    }

    if (updates.program !== undefined) {
      if (typeof updates.program !== "string") {
        return res.status(400).json({
          success: false,
          message: "Program must be text.",
        });
      }

      updates.program = updates.program.trim();
    }

    if (updates.yearLevel !== undefined) {
      if (updates.yearLevel === "" || updates.yearLevel === null) {
        updates.yearLevel = null;
      } else {
        const year = Number(updates.yearLevel);

        if (!Number.isInteger(year) || year < 1 || year > 6) {
          return res.status(400).json({
            success: false,
            message: "Year level must be a whole number from 1 to 6.",
          });
        }

        updates.yearLevel = year;
      }
    }

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: "student" },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      student,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "The email or student ID is already in use.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update student error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update student.",
    });
  }
}

// Delete a student account (admin only)
export async function deleteStudent(req, res) {
  try {
    const student = await User.findOneAndDelete({
      _id: req.params.id,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully.",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    console.error("Delete student error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete student.",
    });
  }
}