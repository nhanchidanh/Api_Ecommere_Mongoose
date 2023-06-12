const expressAsyncHandler = require("express-async-handler");
const productModel = require("../models/product.model");
const { default: slugify } = require("slugify");
const ApiError = require("../utils/api-error");

// Create product?

const createProduct = expressAsyncHandler(async (req, res) => {
  if (Object.keys(req.body).length === 0)
    throw new ApiError(400, "Missing inputs");

  // Create slug
  if (req.body && req.body.title) {
    req.body.slug = slugify(req.body.title);
  }

  const newProduct = await productModel.create(req.body);

  if (!newProduct) throw new ApiError(500, "Failed to create new product");

  return res.status(200).json({
    success: true,
    createdProduct: newProduct,
  });
});

//get one product
const getProduct = expressAsyncHandler(async (req, res) => {
  const { pid } = req.params;
  const product = await productModel.findById(pid);
  return res.status(200).json({
    success: product ? true : false,
    productData: product ? product : "Cannot get product",
  });
});

// Get all product
// Filtering, sorting & pagination
const getProducts = expressAsyncHandler(async (req, res) => {
  const products = await productModel.find();
  return res.status(200).json({
    success: products ? true : false,
    productDatas: products ? products : "Cannot get products",
  });
});
const updateProduct = expressAsyncHandler(async (req, res) => {
  const { pid } = req.params;
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const updatedProduct = await productModel.findByIdAndUpdate(pid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: updatedProduct ? true : false,
    updatedProduct: updatedProduct ? updatedProduct : "Cannot update product",
  });
});
const deleteProduct = expressAsyncHandler(async (req, res) => {
  const { pid } = req.params;
  const deletedProduct = await productModel.findByIdAndDelete(pid);
  return res.status(200).json({
    success: deletedProduct ? true : false,
    deletedProduct: deletedProduct ? deletedProduct : "Cannot delete product",
  });
});

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
