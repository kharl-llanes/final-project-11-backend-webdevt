import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Enrolled", "Completed", "Dropped"],
      default: "Enrolled",
    },
    grade: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same student from enrolling in the same course twice.
enrollmentSchema.index(
  { student: 1, course: 1 },
  { unique: true }
);

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;