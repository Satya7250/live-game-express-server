import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const register = async (req, res) => {
  const user = await authService.register(req.body);
  ApiResponse.created(res, "Registration success", user);
};

const login = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, //7days
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000, //24hours
  });

  ApiResponse.ok(res, "Login successful", { user, accessToken, refreshToken });
};

const logout = async (req, res) => {
  await authService.logout(req.user.id);
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  ApiResponse.ok(res, "Logout Success");
};

const getMe = async (req, res) => {
  const user = await authService.getMe(req.user.id);
  ApiResponse.ok(res, "User Profile", user);
};

const forgotPassword = async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);

  ApiResponse.ok(res, result.message);
};

const resetPassword = async (req, res) => {
  const result = await authService.resetPassword(
    req.params.token,
    req.body.password,
  );

  ApiResponse.ok(res, result.message);
};

const changePassword = async (req, res) => {
  const result = await authService.changePassword(
    req.user.id,
    req.body.oldPassword,
    req.body.newPassword,
  );

  ApiResponse.ok(res, result.message);
};

const verifyEmail = async (req, res) => {
  const result = await authService.verifyEmail(req.params.token);

  ApiResponse.ok(res, result.message);
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  const result = await authService.refresh(refreshToken);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ApiResponse.ok(res, "Token refreshed", result);
};

export {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  changePassword,
  refresh,
};
