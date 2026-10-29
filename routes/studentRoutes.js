import express from "express";

import {
  getStudents,
  getMyProfile,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// A logged-in user can view their own profile.
router.get("/me", protect, getMyProfile);

// Admin-only student management routes.
router.get("/", protect, authorizeRoles("admin"), getStudents);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getStudentById
);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createStudent
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateStudent
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteStudent
);

export default router;