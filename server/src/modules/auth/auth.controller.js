import bcrypt from "bcrypt";
import crypto from "crypto";
import AsyncHandler from "../../utils/AsyncHandler.js";
import AppError from "../../utils/AppError.js";
import AppResponse from "../../utils/AppResponse.js";
import UserModel from "../../../Database/models/user.model.js";
import sendEmail from "../../utils/nodemailer.js";
import jwt from "jsonwebtoken";
import ms from "ms";

const createUser = AsyncHandler(async (req, res, next) => {
  const { fullName, email, password, phoneNumber, role } = req.body;

  if (!fullName || !email || !password || !phoneNumber) {
    return next(
      new AppError(400, "Name, email, password, and phone number are required.")
    );
  }

  const existingUser = await UserModel.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (existingUser) {
    return next(
      new AppError(
        400,
        "A user with the provided email or phone number already exists."
      )
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24);

  const newUser = new UserModel({
    fullName,
    email,
    password: hashedPassword,
    phoneNumber,
    role,
    verificationToken: {
      token: rawToken,
      expiryDate: tokenExpiry,
    },
    status: "active",
    lastLogin: null,
  });

  await newUser.save();

  const verificationUrl = `${process.env.BASE_URL}/auth/verify-email/${rawToken}`;

  const emailSubject = "Verify Your Email for Farmer Market System";
  const emailText = `Please verify your email by clicking the following link: ${verificationUrl}`;
  const emailHtml = `<p>Please verify your email by clicking the following link:</p><a href="${verificationUrl}">${verificationUrl}</a>`;

  try {
    await sendEmail(email, emailSubject, emailText, emailHtml);
  } catch (error) {
    return next(new AppError(500, "Error sending email verification link."));
  }

  return res.status(201).json(
    new AppResponse(
      201,
      {
        fullName: newUser.fullName,
        email: newUser.email,
      },
      "User created successfully. Please verify your email."
    )
  );
});

const loginUser = AsyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return next(new AppError(400, "Email and password are required."));
  }

  const user = await UserModel.findOne({ email, role })
    .select("+password +isEmailVerified +verificationToken")
    .populate("graderProfile");

  if (!user) {
    return next(
      new AppError(404, "User not found with the provided email and role.")
    );
  }

  if (user.status == "inActive") {
    return next(
      new AppError(404, "User is Inactive")
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError(401, "Invalid password. Please try again."));
  }

  if (!user.isEmailVerified) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    user.verificationToken = {
      token: rawToken,
      expiryDate: tokenExpiry,
    };

    await user.save();

    const verificationUrl = `${process.env.BASE_URL}/auth/verify-email?token=${rawToken}`;

    const emailSubject = "Verify Your Email for Farmer Market System";
    const emailText = `Please verify your email by clicking the following link: ${verificationUrl}`;
    const emailHtml = `<p>Please verify your email by clicking the following link:</p><a href="${verificationUrl}">${verificationUrl}</a>`;

    try {
      await sendEmail(email, emailSubject, emailText, emailHtml);
    } catch (error) {
      return next(new AppError(500, "Error sending email verification link"));
    }

    return res
      .status(200)
      .json(new AppResponse(200, {}, "A new verification email has been sent"));
  }

  user.lastLogin = new Date();

  await user.save();

  const expiresIn = process.env.JWT_EXPIRATION || "24h";
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn }
  );

  const expirationTimestamp = Date.now() + ms(expiresIn);

  return res.status(200).json(
    new AppResponse(
      200,
      {
        token,
        tokenExpiration: expirationTimestamp,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          graderProfile: user.graderProfile,
        },
        role: user.role,
      },
      "Login successful"
    )
  );
});

const verifyEmail = AsyncHandler(async (req, res, next) => {
  const { token } = req.query;

  const user = await UserModel.findOne({ "verificationToken.token": token });
  console.log(user);
  if (!user) {
    return next(new AppError(404, "Invalid or expired verification token"));
  }

  if (user.isEmailVerified) {
    return res
      .status(200)
      .json(new AppResponse(200, {}, "Your email is already verified"));
  }

  user.isEmailVerified = true;
  user.verificationToken = null;
  await user.save();

  return res.redirect('https://framer-market.vercel.app/');
});


const resendEmailVerification = AsyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError(400, "Email address is required"));
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new AppError(404, "User not found with this email"));
  }

  if (user.isEmailVerified) {
    return res
      .status(200)
      .json(new AppResponse(200, {}, "Your email is already verified"));
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24);

  user.verificationToken.token = rawToken;
  user.verificationToken.expiryDate = tokenExpiry;
  await user.save();

  const verificationUrl = `${process.env.BASE_URL}/verify-email/${newVerificationToken}`;

  const emailSubject = "Verify Your Email for Farmer Market System";
  const emailText = `Please verify your email by clicking the following link: ${verificationUrl}`;
  const emailHtml = `<p>Please verify your email by clicking the following link:</p><a href="${verificationUrl}">${verificationUrl}</a>`;

  try {
    await sendEmail(email, emailSubject, emailText, emailHtml);
  } catch (error) {
    return next(new AppError(500, "Error sending email verification link"));
  }

  return res
    .status(200)
    .json(new AppResponse(200, {}, "A new verification email has been sent"));
});

const protectedRoutes = AsyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "Token was not provided!"));
  }

  try {
    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new AppError(401, "Invalid token format!"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await UserModel.findById(decoded.userId);

    if (!user) {
      return next(new AppError(404, "User not found!"));
    }

    req.user = user;

    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return next(new AppError(401, "Invalid token!"));
    } else if (err.name === "TokenExpiredError") {
      return next(new AppError(401, "Token has expired! Please log in again."));
    } else {
      return next(
        new AppError(500, "Something went wrong with token verification")
      );
    }
  }
});

const allowedTo = (...roles) => {
  return AsyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          `Access denied. You do not have permission to perform this action. Required roles: ${roles.join(
            ", "
          )}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  });
};

const validateToken = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ isValid: false, error: "Token not provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ isValid: false, error: "Invalid token format" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ isValid: true });
  } catch (err) {
    return res
      .status(401)
      .json({ isValid: false, error: "Invalid or expired token" });
  }
};

export {
  createUser,
  loginUser,
  verifyEmail,
  resendEmailVerification,
  protectedRoutes,
  allowedTo,
  validateToken,
};
