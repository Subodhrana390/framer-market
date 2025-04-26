import { GlobalErrorHandler } from "./middlewares/globalErrorHandler.js";
import authRouter from "./modules/auth/auth.routes.js";
import cropRouter from "./modules/crop/crop.routes.js";
import graderRouter from "./modules/grader/grader.routes.js";
import marketRouter from "./modules/market/market.routes.js";
import userRouter from "./modules/user/user.routes.js";
import AppError from "./utils/AppError.js";

export function bootstrap(app) {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/market", marketRouter);
  app.use("/api/v1/grader", graderRouter);
  app.use("/api/v1/crop", cropRouter);
  app.use("/api/v1/user", userRouter);

  app.all("*", (req, res, next) => {
    next(new AppError(404, "Route not found"));
  });

  app.use(GlobalErrorHandler);
}
