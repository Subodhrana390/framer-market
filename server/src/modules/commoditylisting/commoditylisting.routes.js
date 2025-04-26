import express from "express";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import {
  CommodityListingApproval,
  getListedCommodity,
  getListedCommodityByUser,
  listingCommodity,
} from "./commoditylisting.controller.js";

const commodityListingRouter = express.Router();

commodityListingRouter.post(
  "/",
  protectedRoutes,
  allowedTo("user"),
  listingCommodity
);

commodityListingRouter.get(
  "/",
  protectedRoutes,
  allowedTo("admin"),
  getListedCommodity
);

commodityListingRouter.get(
  "/get-by-user",
  protectedRoutes,
  allowedTo("user"),
  getListedCommodityByUser
);

commodityListingRouter.put(
  "/:listedCommodityId",
  protectedRoutes,
  allowedTo("admin"),
  CommodityListingApproval
);

export default commodityListingRouter;
