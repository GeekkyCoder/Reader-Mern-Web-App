const {
  getUserPosts,
  getSinglePost,
  createPost,
  updatePost,
  deletePost,
  allPosts,
  imageUploadCloud,
  uploadImageControllerLocal,
  getMoreUserBlogPosts,
  getSingleUserPost,
  likePostControler,
  unLikePostController,
  followerPosts,
} = require("../../controllers/blogs/blogs.controller");

const authMiddleware = require("../../middlewares/authMiddleware");
const {authorize} = require("../../middlewares/authorize");

const blogRouter = require("express").Router();


blogRouter.get("/allPosts", allPosts);
blogRouter.get("/user/posts", authMiddleware, getUserPosts);
blogRouter.get("/blogs", getSinglePost);
blogRouter.get("/followerposts", authMiddleware, followerPosts)
blogRouter.get("/currentUserPost", authMiddleware, getSingleUserPost)
blogRouter.get("/getMoreUserPosts", getMoreUserBlogPosts)
blogRouter.post("/createPost", authMiddleware, createPost);
blogRouter.patch("/updatePost", authMiddleware, updatePost);
blogRouter.delete("/deletePost", authMiddleware, deletePost);
blogRouter.post("/uploads/cloudinary", authMiddleware, imageUploadCloud )
blogRouter.post("/upload-local", authMiddleware, uploadImageControllerLocal)
blogRouter.patch("/likepost", likePostControler)
blogRouter.patch("/unlikepost", unLikePostController)

module.exports = blogRouter;
