import User from "../auth/auth.model.js";
import ApiError from "../../common/utils/api-error.js";

//getProfile
const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return user;
};

//updateProfile
const updateProfile = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { returnDocument: 'after', runValidators: true },
  ).select("-password");

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return user;
};

//deleteAccount
const deleteAccount = async (userId, password) => {
  const user = await User.findById(userId).select("+password");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized("Current password is incorrect");
  
  await User.findByIdAndDelete(userId);

  return { message: "Account deleted successfully", userId: user.id };
};

export { getProfile, updateProfile, deleteAccount };
