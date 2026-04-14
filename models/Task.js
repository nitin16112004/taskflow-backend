import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000
    },
    status: {
      type: String,
      enum: ["Todo", "In Progress", "Review", "Done"],
      default: "Todo"
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium"
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"]
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;