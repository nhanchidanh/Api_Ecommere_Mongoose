const expressAsyncHandler = require("express-async-handler");
const blogModel = require("../models/blog.model");
const { default: slugify } = require("slugify");
const ApiError = require("../utils/api-error");

const createBlog = expressAsyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  if (!title || !description || !category)
    throw new ApiError(400, "Missing inputs");

  const response = await blogModel.create(req.body);
  if (!response) {
    throw new ApiError(500, "Cannot create new blog");
  }
  return res.status(200).json({
    success: true,
    message: "Created",
    createdBlog: response,
  });
});

const updateBlog = expressAsyncHandler(async (req, res) => {
  const { bid } = req.params;
  if (Object.keys(req.body).length === 0) throw new ApiError("Missing inputs");

  const response = await blogModel.findByIdAndUpdate(bid, req.body, {
    new: true,
  });

  if (!response) throw new ApiError(500, "Can not update blog. blog not found");

  return res.status(200).json({
    success: true,
    updatedBlog: response,
  });
});

const getBlogs = expressAsyncHandler(async (req, res) => {
  const response = await blogModel.find();

  return res.json({
    success: response ? true : false,
    blogs: response ?? "Can not get blogs",
  });
});

// Like blog
const likeBlog = expressAsyncHandler(async (req, res) => {
  const blogId = req.params.bid;
  const userId = req.user._id;
  if (!blogId) throw new ApiError(400, "Missing inputs");
  //Lay data blog ra
  const blog = await blogModel.findById(blogId);

  //Check dislike: Nếu đã dislike => Xóa dislike(pull id user ra khỏi mảng dislike)
  const checkDisliked = blog?.disLikes?.find(
    (item) => item.toString() === userId
  );
  if (checkDisliked) {
    await blogModel.findByIdAndUpdate(
      blogId,
      { $pull: { disLikes: userId } },
      { new: true }
    );

    // return res.json({
    //   success: true,
    //   message: "Đã bỏ dislike",
    //   response,
    // });
  }

  //Check Like: Nếu đã like => Xóa Like(pull id user ra khỏi mảng like), nếu chưa like => thêm like(push id user vào mảng like)
  const checkLiked = blog?.likes?.find((item) => item.toString() === userId);
  if (checkLiked) {
    const response = await blogModel.findByIdAndUpdate(
      blogId,
      { $pull: { likes: userId } },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Đã bỏ like",
      response,
    });
  } else {
    const response = await blogModel.findByIdAndUpdate(
      blogId,
      { $push: { likes: userId } },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Đã like",
      response,
    });
  }
});

const disLikeBlog = expressAsyncHandler(async (req, res) => {
  const blogId = req.params.bid;
  const userId = req.user._id;
  if (!blogId) throw new ApiError(400, "Missing inputs");
  //Lay data blog ra
  const blog = await blogModel.findById(blogId);

  //Check like: Nếu đã like => Xóa like(pull id user ra khỏi mảng like)
  const checkLiked = blog?.likes?.find((item) => item.toString() === userId);
  if (checkLiked) {
    await blogModel.findByIdAndUpdate(
      blogId,
      { $pull: { likes: userId } },
      { new: true }
    );

    // return res.json({
    //   success: true,
    //   message: "Đã bỏ like",
    //   response,
    // });
  }

  //Check Dislike: Nếu đã dislike => Xóa disLike(pull id user ra khỏi mảng dislike), nếu chưa dislike => thêm dislike(push id user vào mảng dislike)
  const checkDisliked = blog?.disLikes?.find(
    (item) => item.toString() === userId
  );
  if (checkDisliked) {
    const response = await blogModel.findByIdAndUpdate(
      blogId,
      { $pull: { disLikes: userId } },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Đã bỏ dislike",
      response,
    });
  } else {
    const response = await blogModel.findByIdAndUpdate(
      blogId,
      { $push: { disLikes: userId } },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Đã dislike",
      response,
    });
  }
});

module.exports = {
  createBlog,
  updateBlog,
  getBlogs,
  likeBlog,
  disLikeBlog,
};
