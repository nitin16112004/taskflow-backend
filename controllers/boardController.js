import Board from "../models/Board.js";
import List from "../models/List.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

export const createBoard = async (req, res, next) => {
  try {
    const { name, members } = req.body;

    if (!name) {
      res.status(400);
      throw new Error("Board name is required");
    }

    const memberIds = Array.isArray(members) ? members : [];
    const uniqueMembers = [...new Set([req.user._id.toString(), ...memberIds])];

    const board = await Board.create({
      name: name.trim(),
      createdBy: req.user._id,
      members: uniqueMembers
    });

    const defaultLists = ["Todo", "In Progress", "Review", "Done"];
    await Promise.all(
      defaultLists.map((title, index) =>
        List.create({
          title,
          board: board._id,
          position: index
        })
      )
    );

    const createdBoard = await Board.findById(board._id)
      .populate("createdBy", "name email")
      .populate("members", "name email role status");

    return res.status(201).json(createdBoard);
  } catch (error) {
    next(error);
  }
};

export const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }]
    })
      .populate("createdBy", "name email")
      .populate("members", "name email role status")
      .sort({ createdAt: -1 });

    return res.status(200).json(boards);
  } catch (error) {
    next(error);
  }
};

export const getBoardById = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members", "name email role status");

    if (!board) {
      res.status(404);
      throw new Error("Board not found");
    }

    const lists = await List.find({ board: board._id }).sort({ position: 1 });
    const tasks = await Task.find({ board: board._id })
      .populate("assignedUser", "name email role status")
      .populate("list", "title position")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      board,
      lists,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

export const addBoardMember = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400);
      throw new Error("userId is required");
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      res.status(404);
      throw new Error("User not found");
    }

    const board = await Board.findById(req.params.id);
    if (!board) {
      res.status(404);
      throw new Error("Board not found");
    }

    if (!board.members.includes(userId)) {
      board.members.push(userId);
      await board.save();
    }

    const updated = await Board.findById(board._id)
      .populate("createdBy", "name email")
      .populate("members", "name email role status");

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const removeBoardMember = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400);
      throw new Error("userId is required");
    }

    const board = await Board.findById(req.params.id);
    if (!board) {
      res.status(404);
      throw new Error("Board not found");
    }

    board.members = board.members.filter((memberId) => memberId.toString() !== userId);
    await board.save();

    const updated = await Board.findById(board._id)
      .populate("createdBy", "name email")
      .populate("members", "name email role status");

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const getDashboardOverview = async (_req, res, next) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: "Done" });
    const pendingTasks = await Task.countDocuments({ status: { $ne: "Done" } });
    const membersCount = await User.countDocuments({ status: "Active" });

    return res.status(200).json({
      totalTasks,
      completedTasks,
      pendingTasks,
      membersCount
    });
  } catch (error) {
    next(error);
  }
};