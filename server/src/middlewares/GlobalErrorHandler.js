import mongoose from "mongoose";
import AppError from "../utils/AppError.js";

const globalErrorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof AppError)) {
    const statusCode = error instanceof mongoose.Error ? 400 : 500;
    const message =
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : error.message || "Internal Server Error";
    error = new AppError(statusCode, message);
  }

  const response = {
    statusCode: error.statusCode,
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  res.status(response.statusCode).json(response);
};

export default globalErrorHandler;
