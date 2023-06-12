const { createProduct, updateProduct, deleteProduct, getProduct, getProducts } = require("../controllers/product.controller");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

const productRoutes = require("express").Router();

productRoutes.post("/", [verifyAccessToken, isAdmin], createProduct);
productRoutes.get("/", getProducts);

productRoutes.put("/:pid", [verifyAccessToken, isAdmin], updateProduct);
productRoutes.delete(
  "/:pid",
  [verifyAccessToken, isAdmin],
  deleteProduct
);
productRoutes.get("/:pid", getProduct);

module.exports = productRoutes;
