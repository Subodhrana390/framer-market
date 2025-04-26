import mongoose from "mongoose";

const gradingReportSchema = new mongoose.Schema({
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Crop",
    required: true,
  },
  reportId: {
    type: String,
    unique: true,
    default: function () {
      return `GR-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;
    },
  },
  gradedDate: {
    type: Date,
    required: true,
  },
  grader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  grade: {
    type: String,
    required: true,
    enum: [
      "Grade A - Premium",
      "Grade B - Standard",
      "Grade C - Commercial",
      "Grade D - Below Standard",
    ],
  },
  qualityMetrics: {
    moisture: { type: String, required: true },
    foreignMaterial: { type: String, required: true },
    colorScore: { type: Number, min: 0, max: 10 },
    defects: String,
  },
  additionalNotes: String,
  documents: [String],
});
const GradingReportModel = mongoose.model("GradingReport", gradingReportSchema);
export default GradingReportModel;
