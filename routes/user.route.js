const {
  registerController,
  loginController,
  getCurrentUserController,
  refreshAccessTokenController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  getUsersController,
  deleteUserController,
  updateUserController,
  updateUserByAdminController,
} = require("../controllers/user.controller");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

const userRoutes = require("express").Router();

userRoutes.post("/register", registerController);
userRoutes.post("/login", loginController);
userRoutes.get("/current", [verifyAccessToken], getCurrentUserController);
userRoutes.post("/refreshtoken", refreshAccessTokenController);
userRoutes.put("/logout", logoutController);
userRoutes.get("/forgot-password", forgotPasswordController);
userRoutes.put("/reset-password", resetPasswordController);
userRoutes.get("/", [verifyAccessToken, isAdmin], getUsersController);
userRoutes.delete("/:_id", [verifyAccessToken, isAdmin], deleteUserController);
userRoutes.put("/current", [verifyAccessToken], updateUserController);
userRoutes.put(
  "/:_id",
  [verifyAccessToken, isAdmin],
  updateUserByAdminController
);

module.exports = userRoutes;
