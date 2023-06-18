const {
  createBlog,
  updateBlog,
  getBlogs,
  likeBlog,
  disLikeBlog,
  getBlog,
  deleteBlog,
} = require("../controllers/blog.controller");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

const blogRoutes = require("express").Router();

blogRoutes.get("/", getBlogs);
blogRoutes.post("/", [verifyAccessToken, isAdmin], createBlog);
blogRoutes.get("/:bid", getBlog);
blogRoutes.delete("/:bid", [verifyAccessToken, isAdmin], deleteBlog);
blogRoutes.put("/:bid", [verifyAccessToken, isAdmin], updateBlog);
blogRoutes.put("/like/:bid", [verifyAccessToken], likeBlog);
blogRoutes.put("/dislike/:bid", [verifyAccessToken], disLikeBlog);

module.exports = blogRoutes;
//Những route có params thì nên để dưới
