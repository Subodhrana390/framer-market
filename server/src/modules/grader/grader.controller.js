import CropModel from "../../../Database/models/crop.model.js";
import GraderProfileModel from "../../../Database/models/graderprofile.model.js";
import GradingReportModel from "../../../Database/models/gradingreport.model.js";
import UserModel from "../../../Database/models/user.model.js";
import AppError from "../../utils/AppError.js";
import AppResponse from "../../utils/AppResponse.js";
import AsyncHandler from "../../utils/AsyncHandler.js";
import path from "path";

const SubmitVerificationDocuments = AsyncHandler(async (req, res, next) => {
  const graderId = req.user._id;
  let graderProfile = await GraderProfileModel.findOne({ user: graderId });

  // Create a new profile if not exists
  if (!graderProfile) {
    graderProfile = new GraderProfileModel({ user: graderId });
  } else if (graderProfile.isSubmitted) {
    return next(
      new AppError(
        400,
        "Documents have already been submitted for verification"
      )
    );
  }

  const govtIdFile = req.files["govtId"] ? req.files["govtId"][0].path : null;
  const certFile = req.files["gradingCertification"]
    ? req.files["gradingCertification"][0].path
    : null;

  if (!govtIdFile || !certFile) {
    return next(
      new AppError(400, "Both Govt ID and Grading Certification are required")
    );
  }

  graderProfile.govtId = govtIdFile;
  graderProfile.gradingCertification = certFile;
  graderProfile.isSubmitted = true;
  graderProfile.idStatus = "pending";
  graderProfile.certStatus = "pending";
  graderProfile.submittedDate = new Date();

  await graderProfile.save();

  const user = await UserModel.findById(graderId);
  if (!user) {
    return next(new AppError(404, "User not found"));
  }

  user.graderProfile = graderProfile._id;
  await user.save();

  return res.status(200).json(
    new AppResponse(200, {
      message: "Grader documents submitted successfully for verification",
      graderProfile,
    })
  );
});

const verifyGraderDocuments = AsyncHandler(async (req, res, next) => {
  const { graderId } = req.params;
  console.log(graderId);
  const { idStatus, certStatus, rejectionReason } = req.body;

  if (!idStatus || !certStatus) {
    return next(new AppError(400, "Both idStatus and certStatus are required"));
  }

  const graderProfile = await GraderProfileModel.findById(graderId);
  if (!graderProfile) {
    return next(new AppError(404, "Grader profile not found"));
  }

  if (graderProfile.isVerified) {
    return next(new AppError(400, "The documents have already been verified"));
  }

  graderProfile.idStatus = idStatus;
  graderProfile.certStatus = certStatus;

  if (idStatus === "rejected" || certStatus === "rejected") {
    graderProfile.rejectionReason.id = rejectionReason?.id || null;
    graderProfile.rejectionReason.cert = rejectionReason?.cert || null;
  }

  if (idStatus === "approved" && certStatus === "approved") {
    graderProfile.isVerified = true;
    graderProfile.verifiedAt = new Date();
    graderProfile.verifiedBy = req.user._id;
  }

  await graderProfile.save();

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        { graderProfile },
        "Grader documents verification updated successfully"
      )
    );
});

const getGraderProfile = AsyncHandler(async (req, res, next) => {
  const graderId = req.user._id;

  const graderProfile = await GraderProfileModel.findOne({ user: graderId });

  if (!graderProfile) {
    return next(new AppError(404, "Grader profile not found"));
  }

  return res.status(200).json(
    new AppResponse(
      200,
      {
        graderProfile,
      },
      "Grader profile fetched successfully"
    )
  );
});

const getAllGraderProfiles = AsyncHandler(async (req, res, next) => {
  const graderProfiles = await GraderProfileModel.find()
    .populate("user", "fullName email phoneNumber")
    .lean();

  if (!graderProfiles || graderProfiles.length === 0) {
    return next(new AppError(404, "No grader profiles found"));
  }

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        graderProfiles,
        "Grader profiles fetched successfully"
      )
    );
});

const startGrading = AsyncHandler(async (req, res, next) => {
  const { cropId } = req.params;
  const graderId = req.user._id;

  const crop = await CropModel.findById(cropId).populate("submittedBy");

  if (!crop) {
    return next(new AppError(404, "Crop not found"));
  }

  if (crop.status === "graded") {
    return next(new AppError(400, "This crop has already been graded"));
  }

  if (crop.status === "processing") {
    return next(new AppError(400, "This crop is already being processed"));
  }

  if (!crop.assignedGrader) {
    crop.assignedGrader = graderId;
  }

  crop.status = "processing";
  crop.dueDate = new Date(new Date() + 3 * 24 * 60 * 60);

  await crop.save();

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        { cropId: crop._id, status: crop.status, grader: graderId },
        "Grading has started successfully."
      )
    );
});

const submitGradingReport = AsyncHandler(async (req, res, next) => {
  const {
    cropId,
    qualityGrade,
    moistureContent,
    foreignMaterial,
    colorScore,
    defects,
    additionalNotes,
  } = req.body;

  const graderId = req.user._id;

  if (!req.files || req.files.supportingDocs.length == 0) {
    return next(
      new AppError(400, "Exactly two supporting documents must be uploaded.")
    );
  }

  if (
    !cropId ||
    !qualityGrade ||
    !moistureContent ||
    !foreignMaterial ||
    !colorScore
  ) {
    return next(new AppError(400, "All required fields must be provided."));
  }

  const crop = await CropModel.findById(cropId);
  if (!crop) {
    return next(new AppError(404, "Crop not found"));
  }

  if (crop.status !== "processing") {
    return next(
      new AppError(
        400,
        "Grading report can only be submitted if the crop status is 'processing'."
      )
    );
  }

  const supportingDocs = req.files.supportingDocs.map((file) => file.path);

  const newGradingReport = new GradingReportModel({
    cropId,
    grader: graderId,
    grade: qualityGrade,
    qualityMetrics: {
      moisture: moistureContent,
      foreignMaterial,
      colorScore,
      defects,
    },
    gradedDate: new Date(),
    additionalNotes,
    documents: supportingDocs,
  });

  await newGradingReport.save();

  crop.status = "graded";
  crop.gradingResult = newGradingReport._id;
  await crop.save();

  return res
    .status(201)
    .json(
      new AppResponse(
        201,
        { gradingReport: newGradingReport, cropId: crop._id },
        "Grading report submitted successfully"
      )
    );
});

const getGradingHistory = AsyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const gradingReports = await GradingReportModel.find({ grader: userId })
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
    return next(new AppError(404, "No grading history found for this user."));
  }

  const formattedHistory = gradingReports.map((report) => ({
    id: report.reportId,
    cropId: report.cropId._id,
    farmerName: report.cropId.submittedBy?.fullName || "Unknown Farmer",
    cropType: report.cropId.cropType || "Unknown Crop",
    grade: report.grade,
    date: report.gradedDate.toISOString().split("T")[0],
    status: report.cropId.status,
    qualityMetrics: {
      moisture: report.qualityMetrics.moisture,
      foreignMaterial: report.qualityMetrics.foreignMaterial,
      colorScore: report.qualityMetrics.colorScore || 0,
    },
    files: report.documents.map((doc) => doc),
  }));

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

const getAssignedCrops = AsyncHandler(async (req, res, next) => {
  const graderId = req.user._id;

  const assignedCrops = await CropModel.find({ assignedGrader: graderId })
    .populate("submittedBy", "name email")
    .populate("assignedGrader", "name email")
    .sort({ submittedDate: -1 });

  if (!assignedCrops || assignedCrops.length === 0) {
    return next(new AppError(404, "No crops assigned to this grader"));
  }

  return res
    .status(200)
    .json(
      new AppResponse(200, assignedCrops, "Assigned crops fetched successfully")
    );
});

const getDownloadReport = AsyncHandler(async (req, res, next) => {
  const { fileName } = req.params;

  //uploads
  const filePath = `E:/farmer-market-system/server${fileName}`;
});

export {
  SubmitVerificationDocuments,
  verifyGraderDocuments,
  getAllGraderProfiles,
  startGrading,
  submitGradingReport,
  getGradingHistory,
  getAssignedCrops,
  getGraderProfile,
  getDownloadReport,
};
