import express from "express";
import {
  getEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} from "../controllers/enrollmentController.js";
import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// View enrollments
router.get("/", protect, getEnrollments);

// View one enrollment
router.get("/:id", protect, getEnrollmentById);

// Students can enroll themselves in a course
router.post(
  "/",
  protect,
  authorizeRoles("student"),
  createEnrollment
);

// Admin-only actions
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateEnrollment
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteEnrollment
);

export default router;