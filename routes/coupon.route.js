const {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/coupon.controller");

const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

const couponRoutes = require("express").Router();

couponRoutes.post("/", [verifyAccessToken, isAdmin], createCoupon);
couponRoutes.get("/", getCoupons);
couponRoutes.put("/:cid", updateCoupon);
couponRoutes.delete("/:cid", deleteCoupon);

module.exports = couponRoutes;
//Những route có params thì nên để dưới
