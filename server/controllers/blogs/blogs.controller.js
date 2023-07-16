const Post = require("../../modals/blogs/blog.modal");
const User = require("../../modals/users/users.modal");
const Notification = require("../../modals/notifications/notifications.modal");
const {ObjectId} = require("mongodb")
const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");
const { StatusCodes } = require("http-status-codes");

const createPost = async (req, res) => {
  // attaching createdBy Property to req.body which is the userId

  req.body.createdBy = req.user.userId;

  try {
    const user = await User.findById(req.user.userId);

    const post = await Post.create({
      ...req.body,
      name: user.name,
      bio: user.bio,
      profileImage: user.profileImage,
    });

    user.posts.push(req.body);

    await user.save();

    const followers = user.followers;

    const notifications = followers.map((follower) => ({
      recipient: follower.id,
      sender: req.user.userId,
      message: `New blog post: ${post.title}`,
      blogPost: post._id,
    }));

    const createdNotifications = await Notification.create(notifications);

    res.status(201).json({ post, notifications: createdNotifications });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

const allPosts = async (req, res) => {
  let queryObj = {};

  const { tags, sort } = req.query;

  if (tags && tags !== "general") {
    queryObj.tags = tags;
  }

  queryObj.view = "public";

  try {
    let result = Post.find(queryObj);

    if (sort && sort === "newest") {
      result = result.sort("-createdAt");
    } else if (sort && sort === "oldest") {
      result = result.sort("createdAt");
    }

    const pages = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (pages - 1) * limit;

    result = result.skip(skip).limit(limit);

    const blogs = await result;

    const totalBlogs = await Post.countDocuments(queryObj);

    const numOfPages = Math.ceil(totalBlogs / limit);

    res.status(StatusCodes.OK).json({ blogs, totalBlogs, numOfPages });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "could not fetch blogs" });
  }

  // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:err.message})
};

const getUserPosts = async (req, res) => {
  const {user} = req.query
  // const { userId } = req.user;

  try {
    const posts = await Post.find({ createdBy: user });
    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ msg: "could not load posts! something went wrong" });
  }
};

const getSinglePost = async (req, res) => {
  const { post: postId } = req.query;
  try {
    const post = await Post.findOne({
      _id: postId,
    });
    if (!post) {
      return res
        .status(400)
        .json({ msg: `post with id ${postId} does not exist` });
    }

    res.status(200).json({ post });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getSingleUserPost = async (req, res) => {
  const { postId } = req.query;
  const userId = req.user.userId;
  try {
    const userPost = await Post.findOne({ _id: postId, createdBy: userId });
    if (!userPost) {
      return res.status(404).json({ msg: "post does not exist" });
    }
    res.status(200).json({ userPost });
  } catch (err) {
    res.status(500).json({ msg: "something went wrong" });
  }
};

// there is show more blogs for the users in frontend
const getMoreUserBlogPosts = async (req, res) => {
  const { userId, postId } = req.query;

  try {
    const validUser = await User.findOne({ _id: userId });

    if (!validUser) {
      return res.status(404).json({ msg: "not a valid user" });
    }

    const posts = await Post.find({ createdBy: userId });

    if (!posts) {
      return res.status(200).json({ msg: "no posts by this user" });
    }

    if (posts.length <= 0) {
      return res.status(200).json({ msg: "user has no posts" });
    }

    // if posts found for thus user sending them back to frontend,but exclude the current viewing post!!!

    const filteredPosts = posts.filter(
      (post) => post._id.toString() !== postId
    );

    res.status(200).json({ filteredPosts });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const updatePost = async (req, res) => {
  const { postId } = req.query;
  try {
    const post = await Post.findOne({
      _id: postId,
      createdBy: req.user.userId,
    });

    if (!post) {
      return res
        .status(400)
        .json({ msg: `post with id ${postId} does not exist` });
    }

    // update the post
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId, createdBy: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ post: updatedPost });
  } catch (err) {
    res.status(500).json({ msg: "something went wrong!" });
  }
};

const likePostControler = async (req, res) => {
  const { post: postId } = req.query;
  // const {likes} = req.body

  try {
    const post = await Post.findOne({ _id: postId });

    if (!post) {
      return res.status(404).json({ msg: "post does not exist" });
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      { likes: post.likes + 1 },
      { new: true, runValidators: true }
    );

    res.status(200).json({ post: updatedPost });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const unLikePostController = async (req, res) => {
  const { post: postId } = req.query;

  try {
    const post = await Post.findOne({ _id: postId });

    if (!post) {
      return res.status(404).json({ msg: "post does not exist" });
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      { likes: post.likes - 1 },
      { new: true, runValidators: true }
    );

    res.status(200).json({ likes: updatedPost.likes });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const deletePost = async (req, res) => {
  const { post: postId } = req.query;
  try {
    const post = await Post.findOne({
      _id: postId,
      createdBy: req.user.userId,
    });
    if (!post) {
      return res
        .status(400)
        .json({ msg: `post with id ${postId} does not exist` });
    }

    await Post.deleteOne({ _id: post._id });

    const posts = await Post.find({});

    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// single follower post
const followerPosts = async (req, res) => {
  const userId = req.user.userId;
  try {
    const currentUser = await User.findById(userId).populate("followers");

    const followersIds = currentUser.followers.map((follower) => follower.id);

    const posts = await Post.find({ createdBy: { $in: followersIds } });

    return res.status(200).json({  posts });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// upload image to cloud -> cloudinary
const imageUploadCloud = async (req, res) => {
  const { postId } = req.query;
  const userId = req.user.userId;

  try {
    const tempImagePath = req.files?.image?.tempFilePath;
    const options = {
      user_filename: true,
      folder: "reader-blog-web-app-uploads",
    };

    const result = await cloudinary.uploader.upload(tempImagePath, options);
    console.log(result);

    if (!result.resource_type.startsWith("image")) {
      return res
        .status(404)
        .json({ msg: "image must be in png,jpeg,jpg format" });
    }

    if (result.bytes > 2000000) {
      return res
        .status(404)
        .json({ msg: "image must be less than or equal to 2mb in size" });
    }

    // after uploading image to the server removing temp image from temp folder
    fs.unlinkSync(tempImagePath);
    const post = await Post.findOne({ createdBy: userId, _id: postId });
    post.image = result.url;
    await post.save();
    res.status(200).json({ msg: "image uploaded successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const uploadImageControllerLocal = async (req, res) => {
  // req.files (according to docs)
  // console.log(req.files)

  //   checks

  // if file does not exist
  if (!req?.files) {
    res.status(404).json({ msg: "no file uploaded" });
  }
  const blogImage = req.files.image;

  // if invalid format
  if (!blogImage?.mimetype?.startsWith("image")) {
    res.status(404).json({ msg: "image must be in png,jpeg,jpg format" });
  }

  // if size greater than 1mb
  if (blogImage.size > 1024 * 1024) {
    res.status(404).json({ msg: "image must be 1mb in size" });
  }

  const imagePath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "images" + `${blogImage.name}`
  );

  //   console.log(imagePath);

  // move it to the server/make it publicly available, we have a function for that mv(imagePath)

  await blogImage.mv(imagePath);

  res.status(200).json({ image: { src: `/images/${blogImage.name}` } });
};

module.exports = {
  createPost,
  getUserPosts,
  getSinglePost,
  getSingleUserPost,
  followerPosts,
  updatePost,
  deletePost,
  allPosts,
  imageUploadCloud,
  uploadImageControllerLocal,
  getMoreUserBlogPosts,
  likePostControler,
  unLikePostController,
};
