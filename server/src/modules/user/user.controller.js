import AppError from "../../utils/AppError.js";
import AppResponse from "../../utils/AppResponse.js";
import AsyncHandler from "../../utils/AsyncHandler.js";
import GradingReportModel from "../../../Database/models/gradingreport.model.js";
import CropModel from "../../../Database/models/crop.model.js";
import UserModel from "../../../Database/models/user.model.js";

const getGradingHistory = AsyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const userCrops = await CropModel.find({ submittedBy: userId })
    .select("_id cropType status")
    .lean();

  if (!userCrops || userCrops.length === 0) {
    return next(new AppError(404, "No crops found for this user."));
  }

  // Extract just the crop IDs for the next query
  const cropIds = userCrops.map((crop) => crop._id);

  // Now find all grading reports for these crops
  const gradingReports = await GradingReportModel.find({
    cropId: { $in: cropIds },
  })
    .populate("grader", "name email role")
    .populate({
      path: "cropId",
      select: "cropType submittedBy status",
      populate: {
        path: "submittedBy",
        select: "fullName",
      },
    })
    .sort({ gradedDate: -1 });

  if (!gradingReports || gradingReports.length === 0) {
    return next(new AppError(404, "No grading reports found for your crops."));
  }

  // Format the response with proper null checks
  const formattedHistory = gradingReports.map((report) => {
    const cropData = report.cropId || {};
    const submittedBy = cropData.submittedBy || {};
    const qualityMetrics = report.qualityMetrics || {};

    return {
      id: report._id,
      reportId: report.reportId || null,
      cropId: cropData._id || null,
      farmerName: submittedBy.fullName || "Unknown Farmer",
      cropType: cropData.cropType || "Unknown Crop",
      grade: report.grade || "Not Graded",
      date: report.gradedDate?.toISOString().split("T")[0] || "Unknown Date",
      status: cropData.status || "Unknown Status",
      qualityMetrics: {
        moisture: qualityMetrics.moisture || 0,
        foreignMaterial: qualityMetrics.foreignMaterial || 0,
        colorScore: qualityMetrics.colorScore || 0,
      },
      files: report.documents?.map((doc) => doc) || [],
    };
  });

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        formattedHistory,
        "Grading history fetched successfully"
      )
    );
});

const getAllUsers = AsyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Filter out users with role 'admin'
  const filter = { role: { $ne: "admin" } };

  const totalUsers = await UserModel.countDocuments();
  const users = await UserModel.find()
    .skip(skip)
    .limit(limit)
    .select(
      "-createdAt -updatedAt -verificationToken -password -gradingHistory -graderProfile"
    );

  res.status(200).json(
    new AppResponse(
      200,
      {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        users,
      },
      "Users fetched successfully"
    )
  );
});

const changeUserStatus = AsyncHandler(async (req, res, next) => {
  const { status } = req.params;
  const { userId } = req.body;

  if (!userId || !status) {
    return next(new AppError(400, "User ID and status are required"));
  }

  const user = await UserModel.findById(userId);

  if (!user) {
    return res.status(404).json(new AppResponse(404, null, "User not found"));
  }

  user.status = status;
  await user.save();

  res
    .status(200)
    .json(
      new AppResponse(
        200,
        { userId: user._id, status: user.status },
        "User status updated successfully"
      )
    );
});

const deleteUser = AsyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new AppError(400, "User ID is required"));
  }

  const user = await UserModel.findById(userId);

  if (!user) {
    return next(new AppError(404,"User not found"));
  }

  await user.deleteOne();

  res
    .status(200)
    .json(new AppResponse(200, { userId }, "User deleted successfully"));
});

export { getGradingHistory, getAllUsers, changeUserStatus, deleteUser };
