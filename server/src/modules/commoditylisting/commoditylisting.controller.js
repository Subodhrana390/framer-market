import CommodityListingModel from "../../../Database/models/commoditylisitng.model.js";
import CropModel from "../../../Database/models/crop.model.js";
import AppError from "../../utils/AppError.js";
import AppResponse from "../../utils/AppResponse.js";
import AsyncHandler from "../../utils/AsyncHandler.js";

const listingCommodity = AsyncHandler(async (req, res, next) => {
  const { cropId, price } = req.body;
  const userId = req.user._id;

  const listedCommodity = await CommodityListingModel.findOne({ crop: cropId });

  if (listedCommodity)
    return next(new AppError(401, "Commodity is already Listed!"));

  const crop = await CropModel.findById(cropId).populate(
    "gradingResult assignedGrader"
  );

  if (!crop || crop.status !== "graded") {
    return next(new AppError(401, "Crop is not graded"));
  }

  const listingPrice = price + (20 * price) / 100;

  const newListedCommodity = new CommodityListingModel({
    seller: userId,
    crop: cropId,
    price: crop.quantity * listingPrice,
    quantity: crop.quantity,
    unit:
      crop.quantity > 10000 ? "tons" : crop.quantity > 100 ? "quintal" : "kg",
    listedAt: new Date(),
  });

  crop.isListed = true;
  await newListedCommodity.save();

  return res
    .status(201)
    .json(
      new AppResponse(201, newListedCommodity, "Commodity listed for Selling")
    );
});

const CommodityListingApproval = AsyncHandler(async (req, res, next) => {
  const { listedCommodityId } = req.params;
  const { status } = req.body;

  const listedCommodity = await CommodityListingModel.findById(
    listedCommodityId
  );

  if (!listedCommodity)
    return next(new AppError(401, "Commodity is not Listed!"));

  if (listedCommodity.status === "approved") {
    return next(new AppError(401, "Commodity is already approved!"));
  }

  listedCommodity.status = status;
  await listedCommodity.save();

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        listedCommodity,
        `Commodity status updated to ${status}`
      )
    );
});

const getListedCommodityByUser = AsyncHandler(async (req, res, next) => {
  // Read page and limit from query params (default: page 1, 10 items per page)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  // Fetch commodities with pagination
  const listedCommodities = await CommodityListingModel.find({
    seller: req.user._id,
  })
    .sort({ listedAt: -1 })
    .populate("crop")
    .populate("seller", "fullName")
    .skip(skip)
    .limit(limit);

  // Get total count for pagination metadata
  const total = await CommodityListingModel.countDocuments();

  return res.status(200).json(
    new AppResponse(
      200,
      {
        commodities: listedCommodities,
        pagination: {
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          pageSize: limit,
        },
      },
      "Listed Commodities fetched successfully"
    )
  );
});

const getListedCommodity = AsyncHandler(async (req, res, next) => {
  // Read page and limit from query params (default: page 1, 10 items per page)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  // Fetch commodities with pagination
  const listedCommodities = await CommodityListingModel.find()
    .sort({ listedAt: -1 })
    .populate("grader seller")
    .skip(skip)
    .limit(limit);

  // Get total count for pagination metadata
  const total = await CommodityListingModel.countDocuments();

  return res.status(200).json(
    new AppResponse(
      200,
      {
        commodities: listedCommodities,
        pagination: {
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          pageSize: limit,
        },
      },
      "Listed Commodities fetched successfully"
    )
  );
});

export {
  listingCommodity,
  CommodityListingApproval,
  getListedCommodity,
  getListedCommodityByUser,
};
