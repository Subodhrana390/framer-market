import MarketPriceModel from "../../Database/models/marketprice.model.js";

export async function predictNextDayPriceByState(
  state,
  commodity,
  daysToConsider = 7
) {
  try {
    // Get average prices across all APMCs in the state
    const history = await MarketPriceModel.aggregate([
      {
        $match: {
          state,
          commodity,
        },
      },
      {
        $sort: { date: -1 },
      },
      {
        $limit: daysToConsider,
      },
      {
        $group: {
          _id: "$date",
          avg_min_price: { $avg: "$min_price" },
          avg_modal_price: { $avg: "$modal_price" },
          avg_max_price: { $avg: "$max_price" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    if (history.length === 0) {
      throw new Error("No historical data found for this state and commodity");
    }

    // Check for stagnant prices (all ₹1)
    const isStagnant = history.every(
      (day) =>
        day.avg_min_price === 1 &&
        day.avg_modal_price === 1 &&
        day.avg_max_price === 1
    );

    if (isStagnant) {
      return {
        min_price: 1,
        modal_price: 1,
        max_price: 1,
        confidence: "high",
        message: "Prices have been stable at ₹1 across the state",
      };
    }

    // Weighted moving average calculation
    const weights = Array.from({ length: history.length }, (_, i) => i + 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    const predictedModal =
      history.reduce((sum, day, idx) => {
        return sum + day.avg_modal_price * weights[idx];
      }, 0) / totalWeight;

    // Calculate prediction range
    const priceVariance =
      history.reduce((sum, day) => {
        return sum + Math.pow(day.avg_modal_price - predictedModal, 2);
      }, 0) / history.length;

    const predictedMin = Math.max(1, predictedModal - Math.sqrt(priceVariance));
    const predictedMax = predictedModal + Math.sqrt(priceVariance);

    return {
      min_price: parseFloat(predictedMin.toFixed(2)),
      modal_price: parseFloat(predictedModal.toFixed(2)),
      max_price: parseFloat(predictedMax.toFixed(2)),
      confidence: history.length >= 5 ? "medium" : "low",
      message: `Prediction based on weighted average of ${history.length} data points`,
    };
  } catch (error) {
    throw error;
  }
}
