import User from "../models/User.js";
import Task from "../models/Task.js";

export const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    const data = await Promise.all(
      users.map(async (user) => {
        const tasksCount = await Task.countDocuments({ assignedUser: user._id });
        return {
          ...user.toObject(),
          tasksCount
        };
      })
    );

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const tasksCount = await Task.countDocuments({ assignedUser: user._id });

    return res.status(200).json({
      ...user.toObject(),
      tasksCount
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRoleStatus = async (req, res, next) => {
  try {
    const { role, status } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (role) user.role = role;
    if (status) user.status = status;

    const updated = await user.save();

    return res.status(200).json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      status: updated.status
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    await Task.updateMany(
      { assignedUser: user._id },
      { $set: { assignedUser: req.user._id } }
    );

    await user.deleteOne();

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};