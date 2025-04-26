import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    razorpaySubscriptionId: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ["7_days", "1_month", "3_months"],
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["inActive", "active", "cancelled", "expired"],
      default: "inActive",
    },
  },
  { timestamps: true }
);

const SubscriptionModel = mongoose.model("Subscription", subscriptionSchema);

export default SubscriptionModel;
