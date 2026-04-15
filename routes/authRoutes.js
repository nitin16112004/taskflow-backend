import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { validate } from "../middleware/validationMiddleware.js";
import { registerSchema, loginSchema } from "../utils/validationSchemas.js";

const router = express.Router();

// Register
router.post("/register", validate(registerSchema), registerUser);

// Login
router.post("/login", validate(loginSchema), loginUser);

export default router;