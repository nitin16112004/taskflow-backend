import mongoose from "mongoose";
import Task from "../models/Task.js";
import List from "../models/List.js";

const allowedStatuses = ["Todo", "In Progress", "Review", "Done"];

const normalizeStatusFromListTitle = (title = "") => {
  const map = {
    todo: "Todo",
    "in progress": "In Progress",
    review: "Review",
    done: "Done"
  };
  return map[String(title).trim().toLowerCase()] || "Todo";
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, boardId, listId, assignedUser, dueDate, priority = "Medium" } =
      req.body;

    if (!title || !boardId || !listId || !assignedUser || !dueDate) {
      return res.status(400).json({
        message: "title, boardId, listId, assignedUser, dueDate are required"
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(boardId) ||
      !mongoose.Types.ObjectId.isValid(listId) ||
      !mongoose.Types.ObjectId.isValid(assignedUser)
    ) {
      return res.status(400).json({ message: "Invalid boardId, listId or assignedUser" });
    }

    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: "List not found" });

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      status: normalizeStatusFromListTitle(list.title),
      priority,
      dueDate,
      assignedUser,
      board: boardId,
      list: listId,
      createdBy: req.user._id
    });

    return res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const { boardId, listId, status } = req.query;
    const query = {};
    if (boardId) query.board = boardId;
    if (listId) query.list = listId;
    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate("assignedUser", "name email role status")
      .populate("board", "name")
      .populate("list", "title position")
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id || req.params.taskId;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid Task ID" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { title, description, status, priority, dueDate, assignedUser, list } = req.body;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedUser !== undefined) task.assignedUser = assignedUser;

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      task.status = status;
    }

    if (list !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(list)) {
        return res.status(400).json({ message: "Invalid list ID" });
      }

      const targetList = await List.findById(list);
      if (!targetList) return res.status(404).json({ message: "List not found" });

      task.list = list;
      task.status = normalizeStatusFromListTitle(targetList.title);
    }

    const updated = await task.save();

    const populated = await Task.findById(updated._id)
      .populate("assignedUser", "name email role status")
      .populate("board", "name")
      .populate("list", "title position");

    return res.status(200).json(populated);
  } catch (error) {
    next(error);
  }
};

export const moveTask = async (req, res, next) => {
  try {
    const taskId = req.params.id || req.params.taskId;
    const { destinationListId, list } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid Task ID" });
    }

    const targetListId = destinationListId || list;
    if (!targetListId || !mongoose.Types.ObjectId.isValid(targetListId)) {
      return res.status(400).json({ message: "Invalid destination list ID" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const targetList = await List.findById(targetListId);
    if (!targetList) return res.status(404).json({ message: "List not found" });

    task.list = targetListId;
    task.status = normalizeStatusFromListTitle(targetList.title);

    const updated = await task.save();

    const populated = await Task.findById(updated._id)
      .populate("assignedUser", "name email role status")
      .populate("board", "name")
      .populate("list", "title position");

    return res.status(200).json(populated);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id || req.params.taskId;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid Task ID" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();
    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};