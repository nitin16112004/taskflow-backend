import express from "express";
import {
  createBoard,
  getBoards,
  getBoardById,
  addBoardMember,
  removeBoardMember,
  getDashboardOverview
} from "../controllers/boardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getBoards);
router.get("/dashboard/overview", protect, getDashboardOverview);
router.get("/:id", protect, getBoardById);
router.post("/", protect, createBoard);
router.patch("/:id/members/add", protect, addBoardMember);
router.patch("/:id/members/remove", protect, removeBoardMember);

export default router;