import mongoose from "mongoose";

const commodityListingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Crop",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    enum: ["kg", "quintal", "ton"],
    default: "kg",
  },
  listedAt: {
    type: Date,
    default: Date.now,
  },
});

const CommodityListingModel = mongoose.model(
  "CommodityListing",
  commodityListingSchema
);

export default CommodityListingModel;
