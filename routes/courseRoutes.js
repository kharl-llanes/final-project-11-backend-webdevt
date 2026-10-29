import express from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// View courses (logged-in students and admins)
router.get("/", protect, getCourses);

// View one course
router.get("/:id", protect, getCourseById);

// The following actions are for admins only
router.post("/", protect, authorizeRoles("admin"), createCourse);
router.put("/:id", protect, authorizeRoles("admin"), updateCourse);
router.delete("/:id", protect, authorizeRoles("admin"), deleteCourse);

export default router;