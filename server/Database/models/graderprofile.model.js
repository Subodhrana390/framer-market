import mongoose from "mongoose";

const graderProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  gradingHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GradingResult",
    },
  ],

  govtId: {
    type: String,
    required: true,
  },

  gradingCertification: {
    type: String,
    required: true,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  verifiedAt: Date,

  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  idStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  certStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  rejectionReason: {
    id: {
      type: String,
      default: null,
    },
    cert: {
      type: String,
      default: null,
    },
  },

  isSubmitted: {
    type: Boolean,
    default: false,
  },
  submittedDate: {
    type: Date,
    default: null,
  },
});

const GraderProfileModel = mongoose.model("GraderProfile", graderProfileSchema);
export default GraderProfileModel;
