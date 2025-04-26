import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "grader", "user"],
      default: "user",
    },

    graderProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GraderProfile",
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inActive"],
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      token: String,
      expiryDate: Date,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
