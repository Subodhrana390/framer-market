import razorpayInstance from "../../../config/razorpay.js";
import SubscriptionModel from "../../../Database/models/subscription.model.js";
import UserModel from "../../../Database/models/user.model.js";
import AppError from "../../utils/AppError.js";
import AppResponse from "../../utils/AppResponse.js";
import AsyncHandler from "../../utils/AsyncHandler.js";
import crypto from "crypto";

const createSubscription = AsyncHandler(async (req, res, next) => {
  const { plan } = req.body;
  const userId = req.user._id;

  let period;
  if (plan === "7_days") {
    period = 7;
  } else if (plan === "1_month") {
    period = 30;
  } else if (plan === "3_months") {
    period = 90;
  } else {
    return next(new AppError(400, "Invalid plan selected"));
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + period);

  // Create a Razorpay Order (or Subscription if using recurring billing)
  const options = {
    amount: calculateAmount(plan) * 100, // amount in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1, // Auto capture
  };

  const order = await razorpayInstance.orders.create(options);

  const subscription = new SubscriptionModel({
    user: userId,
    razorpaySubscriptionId: order.id, // Save the Razorpay Order ID
    plan,
    startDate,
    endDate,
  });

  await subscription.save();

  return res.status(201).json(
    new AppResponse(
      201,
      {
        order,
        subscription,
      },
      "Subscription created successfully"
    )
  );
});

// Helper to calculate pricing
function calculateAmount(plan) {
  if (plan === "7_days") return 100; // ₹100
  if (plan === "1_month") return 300; // ₹300
  if (plan === "3_months") return 800; // ₹800
}

const confirmSubscription = AsyncHandler(async (req, res, next) => {
  const { userId, razorpayPaymentId, razorpayOrderId, razorpaySignature } =
    req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  console.log(generatedSignature);
  if (generatedSignature !== razorpaySignature) {
    return next(new AppError(400, "Invalid payment signature"));
  }

  const subscription = await SubscriptionModel.findOne({
    user: userId,
  });

  // 3. Update user's subscription field
  await UserModel.findByIdAndUpdate(userId, {
    subscription: subscription._id,
  });

  subscription.razorpayPaymentId = razorpayPaymentId;
  subscription.status = "active";
  subscription.updatedAt = new Date();
  await subscription.save();

  return res
    .status(201)
    .json(
      new AppResponse(201, subscription, "Subscription confirmed successfully")
    );
});

const getCurrentSubscription = AsyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // 1. Find user with populated subscription details
  const user = await UserModel.findById(userId)
    .populate("subscription")
    .select("subscription");

  if (!user) {
    return next(new AppError(404, "User not found"));
  }

  if (!user.subscription) {
    return next(new AppError(404, "No active subscription found"));
  }

  // 2. Return the subscription details
  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        user.subscription,
        "Subscription retrieved successfully"
      )
    );
});
const upgradeSubscription = AsyncHandler(async (req, res, next) => {
  const { newPlan } = req.body;
  const userId = req.user._id;

  const subscription = await SubscriptionModel.findOne({
    user: userId,
    status: "active",
  });

  if (!subscription) {
    return next(new AppError(404, "No active subscription found"));
  }

  // Calculate new endDate
  let additionalDays;
  if (newPlan === "7_days") additionalDays = 7;
  else if (newPlan === "1_month") additionalDays = 30;
  else if (newPlan === "3_months") additionalDays = 90;
  else return next(new AppError(400, "Invalid plan"));

  subscription.plan = newPlan;
  subscription.endDate = new Date();
  subscription.endDate.setDate(subscription.endDate.getDate() + additionalDays);

  await subscription.save();

  return res
    .status(200)
    .json(
      new AppResponse(200, subscription, "Subscription upgraded successfully")
    );
});

const cancelSubscription = AsyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  const subscription = await SubscriptionModel.findOne({
    user: userId,
    status: "active",
  });

  if (!subscription) {
    return next(new AppError(404, "No active subscription to cancel"));
  }

  subscription.status = "cancelled";
  subscription.endDate = new Date();
  await subscription.save();

  return res
    .status(200)
    .json(
      new AppResponse(200, subscription, "Subscription cancelled successfully")
    );
});

export {
  createSubscription,
  confirmSubscription,
  upgradeSubscription,
  cancelSubscription,
  getCurrentSubscription,
};
