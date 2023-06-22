const uploadCloud = require("../config/cloudinary.config");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getProducts,
  ratingProduct,
  uploadImageProduct,
  updateCart,
} = require("../controllers/product.controller");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

const productRoutes = require("express").Router();

productRoutes.post("/", [verifyAccessToken, isAdmin], createProduct);
productRoutes.get("/", getProducts);
productRoutes.put("/rating-product", [verifyAccessToken], ratingProduct);
productRoutes.delete("/:pid", [verifyAccessToken, isAdmin], deleteProduct);
productRoutes.get("/:pid", getProduct);
productRoutes.put("/update-cart/", [verifyAccessToken], updateCart);
productRoutes.put(
  "/upload-image/:pid",
  uploadCloud.array("images", 10),
  uploadImageProduct
);
productRoutes.put("/:pid", [verifyAccessToken, isAdmin], updateProduct);

module.exports = productRoutes;
//Những route có params thì nên để dưới
