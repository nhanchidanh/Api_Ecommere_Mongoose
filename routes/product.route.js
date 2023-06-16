const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getProducts,
  ratingProduct,
} = require("../controllers/product.controller");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

const productRoutes = require("express").Router();

productRoutes.post("/", [verifyAccessToken, isAdmin], createProduct);
productRoutes.get("/", getProducts);
productRoutes.put("/rating-product", [verifyAccessToken], ratingProduct);
productRoutes.delete("/:pid", [verifyAccessToken, isAdmin], deleteProduct);
productRoutes.get("/:pid", getProduct);
productRoutes.put("/:pid", [verifyAccessToken, isAdmin], updateProduct);

module.exports = productRoutes;
//Những route có params thì nên để dưới
