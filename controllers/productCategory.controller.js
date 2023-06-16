const expressAsyncHandler = require("express-async-handler");
const productCategoryModel = require("../models/productCategory.model");
const { default: slugify } = require("slugify");
const ApiError = require("../utils/api-error");

const createProductCategory = expressAsyncHandler(async (req, res) => {
  const response = await productCategoryModel.create(req.body);
  if (!response) {
    throw new ApiError(500, "Cannot create new product-category");
  }
  return res.status(200).json({
    success: true,
    message: "Created",
    createdCategory: response,
  });
});

const getProductCategories = expressAsyncHandler(async (req, res) => {
  const categories = await productCategoryModel.find({});
  if (!categories) {
    throw new ApiError(404, "Product categories not found");
  }
  return res.status(200).json({
    success: true,
    message: "Product categories retrieved successfully",
    categories,
  });
});

const updateProductCategory = expressAsyncHandler(async (req, res) => {
  const categoryId = req.params.cid;
  const category = await productCategoryModel.findByIdAndUpdate(
    categoryId,
    req.body,
    { new: true }
  );
  if (!category) {
    throw new ApiError(404, "Product category not found");
  }

  return res.status(200).json({
    success: true,
    message: "Product category updated successfully",
    category,
  });
});

const deleteProductCategory = expressAsyncHandler(async (req, res) => {
  const categoryId = req.params.cid;
  const category = await productCategoryModel.findByIdAndDelete(categoryId);
  if (!category) {
    throw new ApiError(404, "Product category not found");
  }

  return res.status(200).json({
    success: true,
    message: "Product category deleted successfully",
  });
});

module.exports = {
  createProductCategory,
  getProductCategories,
  updateProductCategory,
  deleteProductCategory,
};
