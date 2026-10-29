import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    units: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    instructor: {
      type: String,
      trim: true,
      default: "",
    },
    semester: {
      type: String,
      enum: ["1st Semester", "2nd Semester", "Summer"],
      required: true,
    },
    schoolYear: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;