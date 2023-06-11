const { notFound, errorHandler } = require("../middlewares/error_handler");
const userRoutes = require("./user.route");
const initRoutes = (app) => {
  app.use("/api/user", userRoutes);

  app.use(notFound);
  app.use(errorHandler);
  // app.use(internalServerError);
};

module.exports = initRoutes;
