const Save = require("../../modals/Saved/Save.modal");
const User = require("../../modals/users/users.modal");
const Post = require("../../modals/blogs/blog.modal");

const { StatusCodes } = require("http-status-codes");
const { UnauthenticatedError, BadRequestError } = require("../../errors");

const createSavePost = async (req, res) => {
  const { post: postId } = req.query;
  const userId = req.user.userId;

  const user = await User.findOne({ _id: userId });
  const post = await Post.findOne({ _id: postId });

  if (!user) {
    throw new BadRequestError("user not found");
  }

  if (!post) {
    throw new BadRequestError("post does not exist");
  }

  const postObj = {
    _id: post._id,
    name: post.name,
    profileImage: post.profileImage,
    bio: post.bio,
    role: post.role,
    createdBy: post.createdBy,
  };

  // Checking if the post already exists
  const savedUserPost = await Save.findOne({ savedBy: userId });

  if (!savedUserPost) {
    const saveObj = { savedBy: userId, postUser: postObj, post };

    const newSavePost = await Save.create(saveObj);

    res.status(201).json({ savePost: newSavePost });
  } else {
    // if the postUser alreadyExist
    const postUserExist =
      savedUserPost.postUser._id.toString() === post._id.toString();

    // console.log(`postUser:${postUserExist}`)

    if (postUserExist) {
      // console.log("it does exist");
      //checking if the post exist as well
      // let savedPostExist = savedUserPost.posts.some(
      //   (savedPost) => savedPost.createdBy.toString() === post.createdBy.toString()
      // );

      // if (savedPostExist) {
      //   return res.status(404).json({ msg: "saved post already exist" });
      // }

      const savedPostExist =
        savedUserPost.post.createdBy.toString() === post.createdBy.toString();

      if (savedPostExist) {
        return res.status(404).json({ msg: "saved post already exist" });
      }

      // it does not exist
      // savedUserPost.posts.push({...post});

      savedUserPost.post = post;

      await savedUserPost.save();

      res.status(200).json({ savedUserPost });
    } else {
      // console.log("it does not exist");
      const saveObj = { savedBy: userId, postUser: postObj, post };

      const newSavePost = await Save.create(saveObj);

      res.status(201).json({ savePost: newSavePost });
    }
  }
};

const unSaveSavedPost = async (req, res) => {
  const { post: postId, save: saveId } = req.query;
  const userId = req.user.userId;

  const savedPost = await Save.findOne({ savedBy: userId });
  const post = await Post.findOne({ _id: postId });

  if (!post) {
    return res.status(404).json({ msg: "not a valid post" });
  }

  // updating the savedPost need to remove the savedPost
  if (!savedPost) {
    return res.status(404).json({ msg: "saved post does not exist" });
  }

  await Save.deleteOne({ _id: saveId });

  res.status(StatusCodes.OK).json({ msg: "unsaved post" });
};

const getUserSavedPosts = async (req, res) => {
  const userId = req.user.userId;

  const savedPosts = await Save.find({ savedBy: userId });

  res.status(StatusCodes.OK).json({ savedPosts });
};

module.exports = { createSavePost, getUserSavedPosts, unSaveSavedPost };
