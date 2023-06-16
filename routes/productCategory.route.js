const {
  createProductCategory,
  getProductCategories,
  updateProductCategory,
  deleteProductCategory,
} = require("../controllers/productCategory.controller");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

const productCategoryRoutes = require("express").Router();

productCategoryRoutes.post(
  "/",
  [verifyAccessToken, isAdmin],
  createProductCategory
);
productCategoryRoutes.get(
  "/",
  [verifyAccessToken, isAdmin],
  getProductCategories
);
productCategoryRoutes.put(
  "/:cid",
  [verifyAccessToken, isAdmin],
  updateProductCategory
);
productCategoryRoutes.delete(
  "/:cid",
  [verifyAccessToken, isAdmin],
  deleteProductCategory
);

module.exports = productCategoryRoutes;
//Những route có params thì nên để dưới
