import express from "express";
import { changeUserStatus, deleteUser, getAllUsers, getGradingHistory } from "./user.controller.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
const userRouter = express.Router();

userRouter.get(
  "/getGradingGistory",
  protectedRoutes,
  allowedTo("user"),
  getGradingHistory
);

userRouter.get(
  "/getAllUsers",
  protectedRoutes,
  allowedTo("admin"),
  getAllUsers
);
userRouter.put(
  "/change-status/:status",
  protectedRoutes,
  allowedTo("admin"),
  changeUserStatus
);
userRouter.delete(
  "/delete/:userId",
  protectedRoutes,
  allowedTo("admin"),
  deleteUser
);

export default userRouter;
