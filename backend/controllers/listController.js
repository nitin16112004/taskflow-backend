import List from "../models/List.js";
import Board from "../models/Board.js";
import Task from "../models/Task.js";

export const createList = async (req, res, next) => {
  try {
    const { title, boardId, position } = req.body;

    if (!title || !boardId) {
      res.status(400);
      throw new Error("title and boardId are required");
    }

    const board = await Board.findById(boardId);
    if (!board) {
      res.status(404);
      throw new Error("Board not found");
    }

    const count = await List.countDocuments({ board: boardId });
    const list = await List.create({
      title: title.trim(),
      board: boardId,
      position: typeof position === "number" ? position : count
    });

    return res.status(201).json(list);
  } catch (error) {
    next(error);
  }
};

export const getListsByBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId);
    if (!board) {
      res.status(404);
      throw new Error("Board not found");
    }

    const lists = await List.find({ board: boardId }).sort({ position: 1 });

    return res.status(200).json(lists);
  } catch (error) {
    next(error);
  }
};

export const updateList = async (req, res, next) => {
  try {
    const { title, position } = req.body;

    const list = await List.findById(req.params.id);
    if (!list) {
      res.status(404);
      throw new Error("List not found");
    }

    if (title !== undefined) list.title = title.trim();
    if (position !== undefined) list.position = Number(position);

    const updated = await list.save();

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      res.status(404);
      throw new Error("List not found");
    }

    const todoList = await List.findOne({ board: list.board, title: "Todo" });

    if (todoList && todoList._id.toString() !== list._id.toString()) {
      await Task.updateMany(
        { list: list._id, board: list.board },
        {
          $set: {
            list: todoList._id,
            status: "Todo"
          }
        }
      );
    } else {
      await Task.deleteMany({ list: list._id, board: list.board });
    }

    await list.deleteOne();

    return res.status(200).json({ message: "List deleted successfully" });
  } catch (error) {
    next(error);
  }
};