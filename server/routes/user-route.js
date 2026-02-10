import express from "express";
import { getUserByUsername, searchUser, updateUser } from "../controllers/user-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

export const userRouter = express.Router();

userRouter.get('/search/query', authMiddleware, searchUser);
userRouter.get("/:username", authMiddleware, getUserByUsername);
userRouter.put("/update/:username", authMiddleware, updateUser);