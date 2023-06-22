const {
  createOrder,
  updateStatusOrder,
  getUserOrder,
  getUsers,
} = require("../controllers/order.controller");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

const orderRoutes = require("express").Router();

orderRoutes.put(
  "/status/:oid",
  [verifyAccessToken, isAdmin],
  updateStatusOrder
);
orderRoutes.post("/", [verifyAccessToken, isAdmin], createOrder);
orderRoutes.get("/user-order", [verifyAccessToken], getUserOrder);
orderRoutes.get("/", [verifyAccessToken, isAdmin], getUsers);

module.exports = orderRoutes;
//Những route có params thì nên để dưới
