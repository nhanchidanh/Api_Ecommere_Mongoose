const { verify, decode } = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const userModel = require("../models/user.model");
const asyncHandler = require("express-async-handler");
const { badRequest } = require("../utils/httpError");
const ApiError = require("../utils/api-error");
const sendMail = require("../utils/send-mail");
const crypto = require("crypto");

exports.registerController = asyncHandler(async (req, res) => {
  const { email, password, firstname, lastname } = req.body;

  // check input
  if (!email || !password || !lastname || !firstname) {
    return res.status(400).json({
      success: false,
      message: "Missing inputs",
    });
  }

  // find user by email
  const user = await userModel.findOne({ email });
  if (user) {
    throw new Error("User has existed");
  } else {
    const newUser = await userModel.create(req.body);
    return res.status(201).json({
      success: newUser ? true : false,
      message: newUser ? "Register is successfully!" : "Something went wrong!",
    });
  }
});

exports.loginController = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // check input
  if (!email || !password) {
    // return badRequest("missing inputs", res);
    throw new ApiError(400, "Missing inputs");
  }

  // find user by email
  const user = await userModel.findOne({ email });

  if (user && (await user.isCorrectPassword(password))) {
    const { role, password, refreshToken, ...userData } = user.toObject();

    // Generate token
    const accessToken = generateAccessToken(user._id, role);
    const newRefreshToken = generateRefreshToken(user._id);

    // Save refreshToken into DB
    await userModel.findByIdAndUpdate(
      user._id,
      { refreshToken: newRefreshToken },
      { new: true } //show data after update
    );

    // Save refreshToken into Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      accessToken,
      userData,
    });
  } else {
    throw new Error("Invalid credential! Password was wrong");
  }
});

// Get current user
exports.getCurrentUserController = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  // console.log(_id);
  const user = await userModel
    .findById(_id)
    .select("-password -role -refreshToken");

  return res.status(200).json({
    success: user ? true : false,
    userData: user ? user : "User not found!",
  });
});

// Generate refresh token
exports.refreshAccessTokenController = asyncHandler(async (req, res) => {
  // Get token from cookie
  const cookie = req.cookies;

  if (!cookie && !cookie.refreshToken) {
    throw new Error("Not found refresh toekn in cookie");
  }

  // check token
  const rs = await verify(cookie.refreshToken, process.env.JWT_SECRET);
  // check it with token in DB
  const response = await userModel.findOne({
    _id: rs?._id,
    refreshToken: cookie.refreshToken,
  });
  return res.status(200).json({
    success: response ? true : false,
    newAccessToken: response
      ? generateAccessToken(response?._id, response?.role)
      : "Refresh token not matched",
  });
});

exports.logoutController = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie && !cookie.refreshToken) {
    throw new Error("Not found refresh token in cookies");
  }

  // delete refresh token in DB
  await userModel.findOneAndUpdate(
    { refreshToken: cookie.refreshToken },
    { refreshToken: "" },
    { new: true }
  );

  // delete refresh token in Cookie Browser
  res.clearCookie("refreshToken", { httpOnly: true, secure: true });

  return res.status(200).json({
    success: true,
    message: "Logout successfully",
  });
});

// Forgot password
exports.forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) throw new ApiError(400, "Missing email");

  const user = await userModel.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const resetToken = await user.createPasswordChangedToken();
  await user.save();

  // send email
  const html = `Vui lòng click vòa link dưới đây để thay đổi mật khẩu. Link này sẽ hết hạn sau 15 phút. <a href="${process.env.URL_SERVER}/api/user/reset-password/${resetToken}">Click here</a>`;

  const data = {
    email,
    html,
  };

  const rs = await sendMail(data);

  return res.status(200).json({
    success: true,
    rs,
  });
});

exports.resetPasswordController = asyncHandler(async (req, res) => {
  const { password, token } = req.body;
  if (!token) throw new ApiError(400, "Missing token");
  if (!password) throw new ApiError(400, "Missing password");

  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await userModel.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Token is invalid or has expired");
  }
  user.password = password;
  user.passwordChangeAt = Date.now();

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  return res.status(200).json({
    success: user ? true : false,
    message: user ? "Update password successfully" : "Something went wrong",
  });
});

// Get all users
exports.getUsersController = asyncHandler(async (req, res) => {
  const users = await userModel.find().select("-password -role -refreshToken"); //Neu khong filter thi find() se get all
  if (!users) throw new ApiError(404, "Not found users");

  return res.status(200).json({
    success: true,
    users,
  });
});

// delete user
exports.deleteUserController = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const deletedUser = await userModel.findByIdAndDelete(_id);
  if (!deletedUser) throw new ApiError(404, "User not found");

  return res.status(200).json({
    success: true,
    message: `User ${deletedUser?.email} was deleted successfully`,
  });
});

// Update user
exports.updateUserController = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { firstname, lastname, email, mobile } = req.body;
  if (!_id || Object.keys(req.body).length === 0)
    throw new ApiError(400, "Missing inputs");

  // Tìm user bằng id và cập nhật thông tin mới
  const updatedUser = await userModel.findByIdAndUpdate(
    _id,
    { firstname, lastname, email, mobile },
    {
      new: true,
    }
  );
  // Nếu không tìm thấy user, throw lỗi
  if (!updatedUser) throw new ApiError(404, "User not found");

  // Trả về kết quả thành công
  return res.status(200).json({
    success: true,
    message: `User ${updatedUser?.email} was updated successfully`,
    data: updatedUser,
  });
});

// Update user by Admin
exports.updateUserByAdminController = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const { password, ...data } = req.body;
  if (!_id || Object.keys(req.body).length === 0)
    throw new ApiError(400, "Missing inputs");

  // Tìm user bằng id và cập nhật thông tin mới
  const updatedUser = await userModel.findByIdAndUpdate(_id, data, {
    new: true,
  });
  // Nếu không tìm thấy user, throw lỗi
  if (!updatedUser) throw new ApiError(404, "User not found");

  // Trả về kết quả thành công
  return res.status(200).json({
    success: true,
    message: `User ${updatedUser?.email} was updated successfully`,
    updatedUser,
  });
});
