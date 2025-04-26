import MarketPriceModel from "../../../Database/models/marketprice.model.js";
import AppResponse from "../../utils/AppResponse.js";
import AppError from '../../utils/AppError.js'
import AsyncHandler from "../../utils/AsyncHandler.js";
import { fetchAndStoreEnamDataService } from "../../utils/cronService.js";
import { predictNextDayPriceByState } from "../../utils/pricePredictor.js";
import axios from "axios";

const ListHierarchical = AsyncHandler(async (req, res, next) => {
  const result = await MarketPriceModel.aggregate([
    {
      $group: {
        _id: "$state",
        apmcs: {
          $addToSet: {
            apmc: "$apmc",
            commodity: "$commodity",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        state: "$_id",
        apmcs: {
          $map: {
            input: {
              $reduce: {
                input: "$apmcs",
                initialValue: [],
                in: {
                  $concatArrays: [
                    "$$value",
                    {
                      $cond: [
                        { $in: ["$$this.apmc", "$$value.apmc"] },
                        [],
                        [{ apmc: "$$this.apmc", commodities: [] }],
                      ],
                    },
                  ],
                },
              },
            },
            as: "apmcObj",
            in: {
              apmc: "$$apmcObj.apmc",
              commodities: {
                $reduce: {
                  input: "$apmcs",
                  initialValue: [],
                  in: {
                    $cond: [
                      { $eq: ["$$this.apmc", "$$apmcObj.apmc"] },
                      { $setUnion: ["$$value", ["$$this.commodity"]] },
                      "$$value",
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
  ]);

  res.status(200).json(new AppResponse(200, result, "successful"));
});

const predictByState = AsyncHandler(async (req, res, next) => {
  const { state, commodity, days } = req.query;

  if (!state || !commodity) {
    return next(
      new AppError(400, "Both 'state' and 'commodity' parameters are required")
    );
  }

  const daysToConsider = days ? parseInt(days) : 7;
  if (isNaN(daysToConsider)) {
    return next(new AppError(400, "The 'days' parameter must be a number"));
  }

  if (daysToConsider < 1 || daysToConsider > 30) {
    return next(
      new AppError(400, "The 'days' parameter must be between 1 and 30")
    );
  }

  const prediction = await predictNextDayPriceByState(
    state,
    commodity,
    daysToConsider
  );

  return res.status(200).json(
    new AppResponse(
      200,
      {
        state,
        commodity,
        prediction_date: new Date(Date.now() + 86400000)
          .toISOString()
          .split("T")[0],
        ...prediction,
        data_points_used: daysToConsider,
      },
      "Prediction successful"
    )
  );
});

const fetchAndStoreEnamData = AsyncHandler(async (req, res, next) => {
  const result = await fetchAndStoreEnamDataService();

  return res.status(200).json(
    new AppResponse(
      200,
      {
        message: `Successfully stored ${result.length} records`,
        data: result,
      },
      "Data fetched and stored successfully"
    )
  );
});

const fetchEnamData = AsyncHandler(async (req, res, next) => {
  const { stateName, apmcName, commodityName, fromDate, toDate } = req.body;

  const formData = {
    language: "en",
    stateName,
    apmcName,
    commodityName,
    fromDate,
    toDate,
  };

  const response = await axios.post(
    "https://enam.gov.in/web/Ajax_ctrl/trade_data_list",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const flattenedData = response.data.data.flat(Infinity);

  return res
    .status(200)
    .json(new AppResponse(200, flattenedData, "Data fetched successfully"));
});

const todayPriceWithMarket = AsyncHandler(async (req, res, next) => {
  const { state, commodity } = req.query;

  if (!state || !commodity) {
    return next(
      new AppError(400, "Both 'state' and 'commodity' parameters are required")
    );
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const prices = await MarketPriceModel.find({
    state,
    commodity,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  }).sort({ date: -1 });

  if (!prices || prices.length === 0) {
    return next(new AppError(404, "No price data available for today"));
  }

  const avgPrices = {
    min_price: 0,
    modal_price: 0,
    max_price: 0,
  };

  prices.forEach((price) => {
    avgPrices.min_price += price.min_price;
    avgPrices.modal_price += price.modal_price;
    avgPrices.max_price += price.max_price;
  });

  avgPrices.min_price = parseFloat(
    (avgPrices.min_price / prices.length).toFixed(2)
  );
  avgPrices.modal_price = parseFloat(
    (avgPrices.modal_price / prices.length).toFixed(2)
  );
  avgPrices.max_price = parseFloat(
    (avgPrices.max_price / prices.length).toFixed(2)
  );

  return res.status(200).json(
    new AppResponse(
      200,
      {
        state,
        commodity,
        date: today,
        state_averages: avgPrices,
        market_prices: prices.map((p) => ({
          apmc: p.apmc,
          min_price: p.min_price,
          modal_price: p.modal_price,
          max_price: p.max_price,
          commodity_arrivals: p.commodity_arrivals,
          commodity_traded: p.commodity_traded,
          unit: p.unit,
        })),
      },
      "Market data fetched successfully"
    )
  );
});

const priceTrends = AsyncHandler(async (req, res, next) => {
  const { state, apmc, commodity, days = 30 } = req.query;

  if (!state || !commodity) {
    return next(
      new AppError(400, "State and commodity parameters are required")
    );
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - parseInt(days));

  const query = {
    state,
    commodity,
    date: { $gte: startDate, $lte: endDate },
  };

  if (apmc) {
    query.apmc = apmc;
  }

  const trends = await MarketPriceModel.find(query)
    .sort({ date: 1 })
    .select(
      "date min_price modal_price max_price commodity_arrivals commodity_traded unit"
    )
    .lean();

  if (trends.length === 0) {
    return next(
      new AppError(
        404,
        "No price data available for the specified filters and time period"
      )
    );
  }

  const response = new AppResponse(
    200,
    {
      state,
      commodity,
      apmc: apmc || "All Markets",
      unit: trends[0].unit,
      days: parseInt(days),
      trends: trends.map((t) => ({
        date: t.date,
        min_price: t.min_price,
        modal_price: t.modal_price,
        max_price: t.max_price,
        commodity_arrivals: t.commodity_arrivals,
        commodity_traded: t.commodity_traded,
      })),
    },
    "Price trends fetched successfully"
  );

  return res.status(200).json(response);
});

export {
  ListHierarchical,
  predictByState,
  fetchAndStoreEnamData,
  fetchEnamData,
  todayPriceWithMarket,
  priceTrends,
};
