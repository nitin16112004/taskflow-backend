import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
      required: true,
    },
  },
  { _id: false }
);

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Board title is required"],
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: {
      type: [memberSchema],
      default: [],
    },
  },
  { timestamps: true }
);

boardSchema.index({ "members.userId": 1 });    //ye index banata hai members.userId par, taki hum efficiently query kar sake ki kaunse boards me ek particular user member hai, jo ki authorization checks ke liye zaruri hota hai

const Board = mongoose.model("Board", boardSchema);    //ye model banata hai Board collection ke liye, jisme boardSchema define kiya gaya hai, aur isse hum database me boards create, read, update, delete kar sakte hai
export default Board;