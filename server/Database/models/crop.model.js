import mongoose from "mongoose";

const sampleCollectionSchema = new mongoose.Schema(
  {
    date: Date,
    timeSlot: String,
    location: String,
  },
  { _id: false }
);

const cropSchema = new mongoose.Schema({
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  cropType: {
    type: String,
    required: true,
  },

  submittedDate: {
    type: Date,
    default: Date.now,
  },

  harvestDate: {
    type: Date,
    required: true,
  },

  quantity: {
    type: String,
    required: true,
  },

  notes: {
    type: String,
    default: "",
  },

  sampleCollection: {
    type: sampleCollectionSchema,
    default: null,
  },

  assignedGrader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  status: {
    type: String,
    enum: ["pending", "processing", "graded"],
    default: "pending",
  },
  isListed: {
    type: Boolean,
    default: false,
  },

  soldQuantity: {
    type: Number,
    default: 0,
  },

  gradingResult: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GradingReport",
    default: null,
  },
  dueDate: {
    type: Date,
    default: null,
  },
});

const CropModel = mongoose.model("Crop", cropSchema);
export default CropModel;
