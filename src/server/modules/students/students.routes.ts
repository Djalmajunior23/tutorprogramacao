import { Router } from "express";
import { 
  getStudents, 
  createStudent, 
  getStudentById, 
  updateStudent, 
  updateStudentStatus, 
  resetStudentPassword,
  deleteStudent,
  getStudentStats
} from "./students.controller";
import { authenticateToken, authorizeRole } from "../../middlewares/auth";

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);
// Only TEACHER and ADMIN can manage students
router.use(authorizeRole(['TEACHER', 'ADMIN']));

router.get("/stats", getStudentStats);
router.get("/", getStudents);
router.post("/", createStudent);
router.get("/:id", getStudentById);
router.patch("/:id", updateStudent);
router.patch("/:id/status", updateStudentStatus);
router.patch("/:id/reset-password", resetStudentPassword);
router.delete("/:id", deleteStudent);

export default router;
