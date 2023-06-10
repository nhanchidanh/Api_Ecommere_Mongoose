const {
  registerController,
  loginController,
  getCurrentUserController,
  refreshAccessToken,
  logoutController,
} = require("../controllers/user.controller");
const { verifyAccessToken } = require("../middlewares/verifyToken");

const userRoutes = require("express").Router();

userRoutes.post("/register", registerController);
userRoutes.post("/login", loginController);
userRoutes.get("/current", [verifyAccessToken], getCurrentUserController);
userRoutes.post("/refreshtoken", refreshAccessToken);
userRoutes.put("/logout", logoutController);

module.exports = userRoutes;
