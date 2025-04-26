import express from "express";
import {
  fetchAndStoreEnamData,
  fetchEnamData,
  ListHierarchical,
  predictByState,
  priceTrends,
  todayPriceWithMarket,
} from "./market.controller.js";

const marketRouter = express.Router();

marketRouter.get("/list-hierarchical", ListHierarchical);
marketRouter.get("/predict-by-state", predictByState);
marketRouter.post("/fetchandstore", fetchAndStoreEnamData);
marketRouter.post("/enam/trade-data", fetchEnamData);
marketRouter.get("/today-prices-with-markets", todayPriceWithMarket);
marketRouter.get("/price-trend", priceTrends);

export default marketRouter;
