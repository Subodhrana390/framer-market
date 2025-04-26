import mongoose from "mongoose";

const cropInventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  harvestDate: {
    type: Date,
    required: true,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  checkedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  isChecked: {
    type: Boolean,
    default: false,
  },
  checkedDate: {
    type: Date,
    required: false,
  },
});

const CropInventoryModel = mongoose.model("CropInventory", cropInventorySchema);
export default CropInventoryModel;
