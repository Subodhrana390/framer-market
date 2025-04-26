import express from "express";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import {
  cancelSubscription,
  confirmSubscription,
  createSubscription,
  upgradeSubscription,
} from "./subscription.controller.js";

const subscriptionRouter = express.Router();

subscriptionRouter.post(
  "/create-subscription",
  protectedRoutes,
  allowedTo("user"),
  createSubscription
);

subscriptionRouter.post("/confirm-subscription", confirmSubscription);
subscriptionRouter.post(
  "/upgrade-subscription",
  protectedRoutes,
  upgradeSubscription
);
subscriptionRouter.post(
  "/cancel-subscription",
  protectedRoutes,
  allowedTo("admin"),
  cancelSubscription
);

export default subscriptionRouter;
