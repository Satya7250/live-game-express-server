import User from "./auth.model.js";
import crypto from "crypto";
import ApiError from "../../common/utils/api-error.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.utils.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from "../../common/config/email.js";

const hashedToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

//register new user
const register = async ({ name, email, password, role, phone, avatar, address, bio }) => {

  if (role === "admin") {
  throw ApiError.forbidden("Admin registration is not allowed");
  }
  
  const existing = await User.findOne({ email });

  if (existing) {
    throw ApiError.conflict("Email already exists");
  }

  const { rawToken, hashedToken } = generateResetToken();

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    avatar,
    address,
    bio,
    verificationToken: hashedToken,
  });

  try {
    await sendVerificationEmail(user.email, rawToken);
  } catch (error) {
    await User.findByIdAndDelete(user._id);

    throw ApiError.internal("Failed to send verification email");
  }

  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.verificationToken;

  return userObj;
};

//verifyEmail
const verifyEmail = async (token) => {
  const hashedVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    verificationToken: hashedVerificationToken,
  }).select("+verificationToken");

  if (!user) {
    throw ApiError.badRequest("Invalid or expired verification token");
  }

  user.isVerified = true;
  user.verificationToken = undefined;

  await user.save();

  return {
    message: "Email verified successfully",
  };
};

//login
const login = async ({ email, password }) => {
  //take email and find user in DB
  //then check if password is correct
  //check if verified or not

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid Email or Password");

  if (!user.isActive) {
  throw ApiError.forbidden("Account has been deactivated");
  }

  //somehow i will check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized("Invalid email or password");

  if (!user.isVerified) {
    throw ApiError.forbidden("Please verify your email before logging in");
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  user.refreshToken = hashedToken(refreshToken);
  await user.save({ validateBeforeSave: false }); //save in DB

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return { user: userObj, accessToken, refreshToken };
};

//refresh token rotation 
const refresh = async (token) => {
  if (!token) {
    throw ApiError.unauthorized("Refresh Token Missing");
  }

  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user) {
    throw ApiError.unauthorized("User not found");
  }

  if (user.refreshToken !== hashedToken(token)) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
  });

  user.refreshToken = hashedToken(refreshToken);

  await user.save({
    validateBeforeSave: false,
  });

  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.refreshToken;

  return {
    user: userObj,
    accessToken,
    refreshToken,
  };
};

//logout
const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

//forgotPassword
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw ApiError.notFound("No account found with this email");
  }

  const { rawToken, hashedToken } = generateResetToken();

  user.resetPasswordToken = hashedToken;
  user.resetPasswordTokenExpiry = Date.now() + 15 * 60 * 1000;

  await user.save();

  try {
    await sendPasswordResetEmail(user.email, rawToken);
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;

    await user.save();

    throw ApiError.internal("Failed to send password reset email");
  }

  return {
    message: "Password reset link sent successfully",
  };
};

//resetPassword
const resetPassword = async (token, newPassword) => {
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedResetToken,
    resetPasswordTokenExpiry: { $gt: Date.now() },
  }).select("+resetPasswordToken");

  if (!user) {
    throw ApiError.badRequest("Password reset token is invalid or has expired");
  }

  user.password = newPassword;

  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiry = undefined;

  await user.save();

  return {
    message: "Password reset successful",
  };
};

//changePassword and send new password to email
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw ApiError.notFound("User not found");

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw ApiError.unauthorized("Current password is incorrect");

  user.password = newPassword;
  await user.save();

  try {
    await sendPasswordChangedEmail(user.email, newPassword);
  } catch (error) {
    throw ApiError.internal("Failed to send password changed email");
  }

  return {
    message: "Password changed successfully",
  };
};

//getMe
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return user;
};

export {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  changePassword,
  getMe,
};
