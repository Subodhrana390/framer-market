import express from "express";
import {
  checkCropByAdmin,
  getAllCrops,
  getGradedCommoditiesByUser,
  submitCrop,
} from "./crop.controller.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";

const cropRouter = express.Router();

cropRouter.post("/submit-crop", protectedRoutes, allowedTo("user"), submitCrop);

cropRouter.get(
  "/getListedCommodities",
  protectedRoutes,
  allowedTo("user"),
  getGradedCommoditiesByUser
);

cropRouter.post(
  "/checkCropByAdmin",
  protectedRoutes,
  allowedTo("admin", "grader"),
  checkCropByAdmin
);

cropRouter.get("/", protectedRoutes, allowedTo("grader"), getAllCrops);

export default cropRouter;
