import express from "express";
import {
  getUsers,
  getUserById,
  updateUserRoleStatus,
  deleteUser
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, adminOnly, updateUserRoleStatus);
router.delete("/:id", protect, adminOnly, deleteUser);

export default router;