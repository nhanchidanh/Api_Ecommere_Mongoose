const { notFound, errorHandler } = require("../middlewares/error_handler");
const productRoutes = require("./product.route");
const userRoutes = require("./user.route");
const initRoutes = (app) => {
  app.use("/api/user", userRoutes);
  app.use("/api/product", productRoutes);

  app.use(notFound);
  app.use(errorHandler);
};

module.exports = initRoutes;
