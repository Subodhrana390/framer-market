import cron from "node-cron";
import SubscriptionModel from "../Database/models/subscription.model.js";

// This cron job will run every day at midnight
const expireSubscriptions = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running subscription expiry check...");

    const now = new Date();

    // Find subscriptions where endDate < now and status is still active
    const expiredSubscriptions = await SubscriptionModel.updateMany(
      { endDate: { $lt: now }, status: "active" },
      { status: "expired" }
    );

    console.log(`Subscriptions expired: ${expiredSubscriptions.nModified}`);
  });
};

export default expireSubscriptions;
