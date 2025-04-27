import AsyncHandler from "../../utils/AsyncHandler.js";
import CropModel from "../../../Database/models/crop.model.js";
import UserModel from "../../../Database/models/user.model.js";
import CropInventoryModel from "../../../Database/models/cropInventory.model.js";
import AppResponse from "../../utils/AppResponse.js";

const submitCrop = AsyncHandler(async (req, res, next) => {
  const { cropType, quantity, harvestDate, notes, sampleCollection } = req.body;

  const submittedBy = req.user._id;

  if (!cropType || !quantity || !harvestDate) {
    return next(
      new AppError(400, "Crop type, quantity, and harvest date are required.")
    );
  }

  const { date, timeSlot, location } = sampleCollection || {};

  const newCrop = new CropModel({
    cropType,
    quantity,
    harvestDate,
    notes,
    sampleCollection: { date, timeSlot, location },
    submittedBy,
  });

  await newCrop.save();

  return res.status(201).json(
    new AppResponse(
      201,
      {
        cropType: newCrop.cropType,
        quantity: newCrop.quantity,
        harvestDate: newCrop.harvestDate,
      },
      "Crop submitted successfully"
    )
  );
});

const addCropToInventory = AsyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const submitter = await UserModel.findById(userId);

  if (!submitter) {
    return next(new AppError(404, "User not found!"));
  }

  const newCrop = new CropInventoryModel({
    name: "Wheat",
    quantity: 100,
    unit: "kg",
    harvestDate: new Date("2023-05-15"),
    submittedBy: submitter._id,
  });

  await newCrop.save();

  return res.status(201).json({
    status: "success",
    data: {
      crop: newCrop,
    },
    message: "New crop submitted successfully to the inventory!",
  });
});

const checkCropByAdmin = AsyncHandler(async (req, res, next) => {
  const { cropId } = req.body;
  const adminId = req.user._id;

  const crop = await CropInventoryModel.findById(cropId);

  if (!crop) {
    return next(new AppError(404, "Crop not found!"));
  }
  const admin = await User.findById(adminId);

  if (crop.isChecked) {
    return next(new AppError(400, "Crop has already been checked."));
  }

  crop.isChecked = true;
  crop.checkedBy = admin._id;
  crop.checkedDate = new Date();

  await crop.save();

  return res.status(200).json({
    status: "success",
    data: {
      crop,
    },
    message: "Crop successfully checked by the admin.",
  });
});

const getAllCrops = AsyncHandler(async (req, res, next) => {
  const crops = await CropModel.find()
    .populate("submittedBy", "fullName email role")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new AppResponse(200, { crops }, "All crops fetched successfully"));
});

const getGradedCommoditiesByUser = AsyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalCrops = await CropModel.countDocuments({
    submittedBy: req.user._id,
    isListed: true,
    status: "graded",
  });

  const crops = await CropModel.find({
    submittedBy: req.user._id,
    status: "graded",
    isListed: true,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("cropType harvestDate quantity");

  return res.status(200).json(
    new AppResponse(
      200,
      {
        crops,
        totalCrops,
        page,
        limit,
        totalPages: Math.ceil(totalCrops / limit),
      },
      "All crops fetched successfully"
    )
  );
});

export {
  addCropToInventory,
  submitCrop,
  checkCropByAdmin,
  getAllCrops,
  getGradedCommoditiesByUser,
};
