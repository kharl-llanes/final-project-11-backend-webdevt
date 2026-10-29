import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    program: {
      type: String,
      trim: true,
      default: "",
    },
    yearLevel: {
      type: Number,
      min: 1,
      max: 6,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;