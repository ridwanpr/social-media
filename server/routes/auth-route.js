import express from "express";
import { loginUser, registerUser } from "../controllers/auth-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/me", authMiddleware, (_req, res) => {
  return res.sendStatus(200);
});

export { authRouter };
