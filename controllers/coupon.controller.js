const expressAsyncHandler = require("express-async-handler");
const couponModel = require("../models/coupon.model");
const ApiError = require("../utils/api-error");

const createCoupon = expressAsyncHandler(async (req, res) => {
  const { name, discount, expiry } = req.body;
  if (!name || !discount || !expiry) throw new ApiError(400, "Missing inputs");

  const response = await couponModel.create({
    ...req.body,
    expiry: Date.now() + +expiry * 24 * 60 * 60 * 1000,
  });

  if (!response) throw new ApiError(500, "Cannot create coupon");

  return res.json({
    success: true,
    message: "Created",
    createdCoupon: response,
  });
});

const getCoupons = expressAsyncHandler(async (req, res) => {
  const response = await couponModel.find().select("-createdAt -updatedAt");

  if (!response) throw new ApiError(500, "Some things went wrong");

  return res.json({
    success: true,
    coupons: response,
  });
});

const updateCoupon = expressAsyncHandler(async (req, res) => {
  const { cid } = req.params;

  if (Object.keys(req.body).length === 0)
    throw new ApiError(400, "Missing inputs");

  if (req.body.expiry) {
    req.body.expiry = Date.now() + +req.body.expiry * 24 * 60 * 60 * 1000;
  }

  const response = await couponModel.findByIdAndUpdate(cid, req.body, {
    new: true,
  });

  if (!response) throw new ApiError(500, "Coupon not found");

  return res.json({
    success: true,
    message: "Updated",
    updatedCoupon: response,
  });
});

const deleteCoupon = expressAsyncHandler(async (req, res) => {
  const { cid } = req.params;

  const response = await couponModel.findByIdAndDelete(cid);

  if (!response) throw new ApiError(500, "Coupon not found");

  return res.json({
    success: true,
    message: "Deleted",
    deletedCoupon: response,
  });
});
module.exports = {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
};
