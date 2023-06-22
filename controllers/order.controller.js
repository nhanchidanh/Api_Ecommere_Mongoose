const expressAsyncHandler = require("express-async-handler");
const couponModel = require("../models/coupon.model");
const ApiError = require("../utils/api-error");
const userModel = require("../models/user.model");
const orderModel = require("../models/order.model");

const createOrder = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { couponId } = req.body;

  const userCart = await userModel
    .findById(_id)
    .select("cart")
    .populate("cart.productId", "title price");

  const products = userCart?.cart?.map((item) => ({
    product: item?.productId?._id,
    count: item?.quantity,
    color: item?.color,
  }));

  //Tính tổng tiền chưa bao gồm discount
  let total = userCart?.cart.reduce(
    (sum, item) => item?.productId?.price * item?.quantity + sum,
    0
  );

  //Nếu có điscount thì tính lại total
  if (couponId) {
    const coupon = await couponModel.findById(couponId);
    total =
      Math.round((total * (1 - parseInt(coupon?.discount) / 100)) / 1000) *
      1000;
  }

  const rs = await orderModel.create({
    products,
    total,
    orderBy: _id,
    coupon: couponId,
  });

  return res.json({
    success: rs ? true : false,
    message: "Created",
    rs,
  });
});

const updateStatusOrder = expressAsyncHandler(async (req, res) => {
  const orderId = req.params.oid;
  const { status } = req.body;

  if (!status) throw new ApiError(400, "Missing inputs");

  const response = await orderModel.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );
  if (!response) throw new ApiError(404, "Order not found!");

  return res.json({
    success: true,
    response: response || "Something went wrong!",
  });
});

const getUserOrder = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const response = await orderModel.find({ orderBy: userId });

  if (!response) throw new ApiError(500, "Something went wrong!");

  return res.status(200).json({
    success: true,
    UserOrder: response,
  });
});

const getUsers = expressAsyncHandler(async (req, res) => {
  const response = await orderModel.find();

  if (!response) throw new ApiError(500, "Something went wrong!");

  return res.status(200).json({
    success: true,
    orders: response,
  });
});

module.exports = {
  createOrder,
  updateStatusOrder,
  getUserOrder,
  getUsers,
};
