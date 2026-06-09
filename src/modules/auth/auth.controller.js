import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    ApiResponse.created(res, "Registration success", user);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return ApiResponse.ok(res, "Login successful", {
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    ApiResponse.ok(res, "Logout Success");
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    ApiResponse.ok(res, "User Profile", user);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);

    ApiResponse.ok(res, result.message);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(
      req.params.token,
      req.body.password,
    );

    ApiResponse.ok(res, result.message);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(
      req.user.id,
      req.body.oldPassword,
      req.body.newPassword,
    );

    ApiResponse.ok(res, result.message);
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.params.token);

    ApiResponse.ok(res, result.message);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    const result = await authService.refresh(refreshToken);

    const isProduction =
      process.env.NODE_ENV === "production";

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    ApiResponse.ok(res, "Token refreshed", result);
  } catch (error) {
    next(error);
  }
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
