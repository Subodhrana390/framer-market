import { GlobalErrorHandler } from "./middlewares/globalErrorHandler.js";
import appointmentRouter from "./modules/appointment/appointment.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import commodityListingRouter from "./modules/commoditylisting/commoditylisting.routes.js";
import cropRouter from "./modules/crop/crop.routes.js";
import graderRouter from "./modules/grader/grader.routes.js";
import marketRouter from "./modules/market/market.routes.js";
import subscriptionRouter from "./modules/subscription/subscription.routes.js";
import userRouter from "./modules/user/user.routes.js";
import AppError from "./utils/AppError.js";

export function bootstrap(app) {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/market", marketRouter);
  app.use("/api/v1/grader", graderRouter);
  app.use("/api/v1/crop", cropRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/listing", commodityListingRouter);
  app.use("/api/v1/appointment", appointmentRouter);
  app.use("/api/v1/subscriptions", subscriptionRouter);

  app.all("*", (req, res, next) => {
    next(new AppError(404, "Route not found"));
  });

  app.use(GlobalErrorHandler);
}
