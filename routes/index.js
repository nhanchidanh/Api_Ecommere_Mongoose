const { notFound, errorHandler } = require("../middlewares/error_handler");
const blogRoutes = require("./blog.route");
const couponRoutes = require("./coupon.route");
const productRoutes = require("./product.route");
const productCategoryRoutes = require("./productCategory.route");
const userRoutes = require("./user.route");
const initRoutes = (app) => {
  app.use("/api/user", userRoutes);
  app.use("/api/product", productRoutes);
  app.use("/api/product-category", productCategoryRoutes);
  app.use("/api/blog", blogRoutes);
  app.use("/api/coupon", couponRoutes);

  app.use(notFound);
  app.use(errorHandler);
};

module.exports = initRoutes;
