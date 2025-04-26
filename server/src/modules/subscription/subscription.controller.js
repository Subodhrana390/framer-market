import razorpayInstance from "../../../config/razorpay.js";
import SubscriptionModel from "../../../Database/models/subscription.model.js";
import UserModel from "../../../Database/models/user.model.js";
import AppError from "../../utils/AppError.js";
import AppResponse from "../../utils/AppResponse.js";
import AsyncHandler from "../../utils/AsyncHandler.js";

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
        orderId: order.id,
        subscription,
      },
      "Subscription created successfully"
    )
  );
});

// Helper to calculate pricing
function calculateAmount(plan) {
  if (plan === "1_month") return 300; // ₹300
  if (plan === "3_months") return 800; // ₹800
}

const confirmSubscription = AsyncHandler(async (req, res, next) => {
  const { userId, razorpayPaymentId, razorpaySubscriptionId } = req.body;

  if (!razorpayPaymentId || !razorpaySubscriptionId) {
    return next(new AppError(400, "Missing paymentId or subscriptionId"));
  }

  // 1. Verify payment with Razorpay
  const payment = await razorpayInstance.payments.fetch(razorpayPaymentId);

  if (!payment) {
    return next(new AppError(404, "Payment not found"));
  }

  if (payment.subscription_id !== razorpaySubscriptionId) {
    return next(new AppError(400, "Subscription ID mismatch"));
  }

  if (payment.status !== "captured") {
    return next(new AppError(400, "Payment not captured"));
  }

  // 2. Create subscription in your DB
  const planMapping = {
    plan_7days_id: { name: "7_days", days: 7 },
    plan_1month_id: { name: "1_month", days: 30 },
    plan_3months_id: { name: "3_months", days: 90 },
  };

  // You should map Razorpay Plan IDs to your own app plan names

  const subscriptionPlan = planMapping[payment.plan_id];

  if (!subscriptionPlan) {
    return next(new AppError(400, "Unknown Plan ID"));
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + subscriptionPlan.days);

  const subscription = await SubscriptionModel.create({
    user: userId,
    razorpaySubscriptionId,
    plan: subscriptionPlan.name,
    startDate,
    endDate,
    status: "active",
  });

  // 3. Update user's subscription field
  await UserModel.findByIdAndUpdate(userId, {
    subscription: subscription._id,
  });

  return res
    .status(201)
    .json(
      new AppResponse(201, subscription, "Subscription confirmed successfully")
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
};
