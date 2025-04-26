import express from "express";
import {
  createUser,
  loginUser,
  resendEmailVerification,
  validateToken,
  verifyEmail,
} from "./auth.controller.js";

const authRouter = express.Router();

authRouter.post("/create-user", createUser);
authRouter.post("/login-user", loginUser);
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/resend-email-verification", resendEmailVerification);
authRouter.get("/validate-token", validateToken);

export default authRouter;
