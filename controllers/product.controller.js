const expressAsyncHandler = require("express-async-handler");
const productModel = require("../models/product.model");
const { default: slugify } = require("slugify");
const ApiError = require("../utils/api-error");
const userModel = require("../models/user.model");

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

const getProducts = expressAsyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const filter = req.query.filter || {};

  //Filter theo giá
  if (req.query.minPrice && req.query.maxPrice) {
    filter.price = { $gte: req.query.minPrice, $lte: req.query.maxPrice };
  } else if (req.query.minPrice) {
    filter.price = { $gte: req.query.minPrice };
  } else if (req.query.maxPrice) {
    filter.price = { $lte: req.query.maxPrice };
  }

  // Filter theo tên sản phẩm
  if (req.query.title) {
    filter.title = { $regex: req.query.title, $options: "i" };
  }

  // Sort theo các trường: title, -title,...
  const sort = {};
  if (req.query.sort) {
    const sortFields = req.query.sort.split(",");
    sortFields.forEach((sortField) => {
      const direction = sortField.startsWith("-") ? -1 : 1;
      const field = sortField.replace(/^-/, "");
      sort[field] = direction;
    });
  }

  //Limit field: title, brand,...
  let select;
  if (req.query.select) {
    //console.log(req.query.select);
    select = req.query.select.replace(/,/g, " ");
  }

  const options = {
    page,
    limit,
    sort,
    select,
  };

  //paginate la thư viện hỗ trợ phân trang kèm query và sort,select trong option
  const products = await productModel.paginate(filter, options);
  return res.status(200).json({
    success: true,
    ...products,
  });
});

// Update prodcut
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

// Delete product
const deleteProduct = expressAsyncHandler(async (req, res) => {
  const { pid } = req.params;
  const deletedProduct = await productModel.findByIdAndDelete(pid);
  return res.status(200).json({
    success: deletedProduct ? true : false,
    deletedProduct: deletedProduct ? deletedProduct : "Cannot delete product",
  });
});

// Rating: start, infoUser, commment
const ratingProduct = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;
  // console.log(_id);

  const { star, comment, pid } = req.body;
  if (!star || !pid) {
    throw new ApiError(400, "Missing inputs");
  }

  // Lấy ra thông tin sản phẩm gồm có ratings
  const product = await productModel.findById(pid);

  // Kiểm tra xem sản phẩm đã được đánh giá bởi cùng 1 user hay khác user
  const checkRating = product?.ratings?.find(
    (item) => item?.postedBy.toString() === userId //postedBy là một ObjectId nên phải chuyển về dạng String để so sánh với userId
  );
  if (checkRating) {
    // update star and comment
    console.log("Đã đánh giá, chỉ cần cập nhật lại rating");
    await productModel.updateOne(
      {
        ratings: { $elemMatch: checkRating },
      },
      { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
      { new: true }
    );
  } else {
    // Add star and comment
    console.log("Chưa đánh giá, tạo mới rating");
    await productModel.findByIdAndUpdate(
      pid,
      {
        $push: { ratings: { star, comment, postedBy: userId } },
      },
      { new: true }
    );
  }

  // Product sau khi cập nhật
  const updatedProduct = await productModel.findById(pid);
  // Số người đánh giá
  ratingCount = updatedProduct.ratings?.length;
  //Tổng số sao đánh giá
  const sumRatings = updatedProduct?.ratings?.reduce(
    (sum, item) => sum + +item?.star,
    0
  );

  // tính tổng và làm tròn bằng cách * 10 ,/ 10
  updatedProduct.totalRatings =
    Math.round((sumRatings * 10) / ratingCount) / 10;

  await updatedProduct.save();

  return res.status(200).json({
    success: true,
    message: "OK",
    updatedProduct,
  });
});

//Upload file to cloudinary
const uploadImageProduct = expressAsyncHandler(async (req, res) => {
  const { pid } = req.params;
  if (!pid || !req.files) throw new ApiError(400, "Missing inputs");

  const response = await productModel.findByIdAndUpdate(
    pid,
    {
      $push: { images: { $each: req.files.map((item) => item?.path) } }, //$each: loop qua mỗi phtử. vì hàm map trả ra một mảng mới
    },
    { new: true }
  );

  if (!response) throw new ApiError(404, "Product not found");

  return res.status(200).json({
    status: true,
    updatedProduct: response,
  });
});

//Update cart
const updateCart = expressAsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { pid, quantity, color } = req.body;

  if (!pid || !quantity || !color) throw new ApiError(400, "Missing inputs");

  const user = await userModel.findById(userId).select("cart");

  //Check id product và color với inputs
  const checkPidAndColor = user?.cart?.find(
    (item) => item?.productId.toString() === pid && item?.color === color
  );

  if (checkPidAndColor) {
    //Nếu trùng => update quantity
    const response = await userModel.updateOne(
      { cart: { $elemMatch: checkPidAndColor } },
      { $set: { "cart.$.quantity": quantity } },
      { new: true }
    );
    return res.json({
      success: response ? true : false,
      rs: response || "Something went wrong",
    });
  } else {
    //Nếu không trùng => thêm sản phẩm vào cart
    const response = await userModel.findByIdAndUpdate(
      userId,
      {
        $push: { cart: { productId: pid, quantity, color } },
      },
      { new: true }
    );
    return res.json(response?.cart);
  }
});

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  ratingProduct,
  uploadImageProduct,
  updateCart,
};
