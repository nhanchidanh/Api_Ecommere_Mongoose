const { verify, decode } = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const userModel = require("../models/user.model");
const asyncHandler = require("express-async-handler");

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

exports.loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // check input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing inputs",
    });
  }

  // find user by email
  const user = await userModel.findOne({ email });

  if (user && (await user.isCorrectPassword(password))) {
    const { role, password, ...userData } = user.toObject();

    // Generate token
    const accessToken = generateAccessToken(user._id, role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refreshToken into DB
    await userModel.findByIdAndUpdate(
      user._id,
      { refreshToken },
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

exports.refreshAccessToken = asyncHandler(async (req, res) => {
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
