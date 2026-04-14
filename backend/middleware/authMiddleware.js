import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Board from "../models/Board.js";
import List from "../models/List.js";
import Task from "../models/Task.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: missing token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: admin only" });
  }
  next();
};

const isBoardMember = (board, userId) => {
  if (board.ownerId?.toString() === userId.toString()) return true;

  if (Array.isArray(board.members) && board.members.length > 0) {
    // supports both [{userId, role}] and [ObjectId]
    const first = board.members[0];
    if (first && typeof first === "object" && first.userId) {
      return board.members.some((m) => m.userId.toString() === userId.toString());
    }
    return board.members.some((m) => m.toString() === userId.toString());
  }

  return false;
};

export const authorizeBoardAccess = async (req, res, next) => {
  try {
    const boardId = req.params.boardId || req.params.id || req.body.boardId || req.query.boardId;

    if (!boardId || !mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ message: "Valid boardId is required" });
    }

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });

    if (!isBoardMember(board, req.user._id)) {
      return res.status(403).json({ message: "Forbidden: board access denied" });
    }

    req.board = board;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeListAccess = async (req, res, next) => {
  try {
    const listId = req.params.listId || req.params.id || req.body.listId || req.body.list;

    if (!listId || !mongoose.Types.ObjectId.isValid(listId)) {
      return res.status(400).json({ message: "Valid listId is required" });
    }

    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: "List not found" });

    const boardId = list.boardId || list.board;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });

    if (!isBoardMember(board, req.user._id)) {
      return res.status(403).json({ message: "Forbidden: list access denied" });
    }

    req.list = list;
    req.board = board;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeTaskAccess = async (req, res, next) => {
  try {
    const taskId = req.params.taskId || req.params.id || req.body.taskId;

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Valid taskId is required" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const boardId = task.boardId || task.board;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });

    if (!isBoardMember(board, req.user._id)) {
      return res.status(403).json({ message: "Forbidden: task access denied" });
    }

    req.task = task;
    req.board = board;
    next();
  } catch (error) {
    next(error);
  }
};