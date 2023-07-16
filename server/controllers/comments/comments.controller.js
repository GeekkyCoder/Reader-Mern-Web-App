const Comment = require("../../modals/comments/comments.modals");
const Post = require("../../modals/blogs/blog.modal");
const User = require("../../modals/users/users.modal");

const createComment = async (req, res) => {
  // create a comment on a post
  const { postId } = req.query;

  const userId = req.user.userId

  const { content } = req.body;

  if(!content){
    return res.status(404).json({msg:"please write a comment in above field before sending"})
  }

  // is the post valid you want to comment
  try {
    let isValidPost = await Post.findOne({ _id: postId });

    // does current user already created a comment
    const alreadyCommented = isValidPost.comments.some(
      (commenter) => commenter.id.toString() === userId
    );

    if (alreadyCommented) {
      return res
        .status(403)
        .json({ msg: "you can not post more than one comments" });
    }

    // if this user has not created a comment on this post, create a comment for this user
    let user = await User.findOne({ _id: userId });


    //creating the comment on this post
    const newComment = {
      id: user._id,
      name: user.name,
      bio: user.bio,
      profileImage:user.profileImage,
      createdAt: Date.now(),
      content: content,
    };

    isValidPost.comments.push(newComment);

    await isValidPost.save();

    // add this comment into comment's comment property and post's comment property
    // await Comment.create({post:postId})

    let comment = await Comment.findOne({ post: postId });

    if (!comment) {
      comment = new Comment({ post: postId });
    }

    comment.comments.push(newComment);

    await comment.save();

    res.status(200).json({msg: "comment posted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getAllComments = async (req, res) => {
  const {post} = req.query 

  try {
    const comments = await Comment.find({post});
    res.status(200).json({ comments });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getUserComments = async (req, res) => {
  try {
    const comments = await Comment.find({ user: req.user.userId });
    res.status(200).json({ comments });
  } catch (err) {
    res.status(500).json({ msg: "something went wrong" });
  }
};

const getSingleComment = async (req, res) => {
  const { id: commentId } = req.params;
  try {
    const comment = await Comment.findOne({ _id: commentId });
    res.status(200).json({ comment });
  } catch (err) {
    res.status(500).json({ msg: "something went wrong" });
  }
};

const updateComment = async (req, res) => {
  const { id: commentId } = req.params;
  const { content } = req.body;

  const userId = req.user.userId;

  try {
    const comment = await Comment.findOne({ _id: commentId });
    if (!comment) {
      return res.status(400).json({ msg: `no comment with id ${commentId}` });
    }

    //update comment
    const commentFound = comment.comments.find(
      (commentator) => commentator.id === userId
    );

    commentFound.content = content;

    await comment.save();

    res.status(200).json({ msg: "comment updated" });
  } catch (err) {
    res.status(500).json({ msg: "something went wrong" });
  }
};

const deleteComment = async (req, res) => {
  const { commentId, postId } = req.query;

  try {
    const comment = await Comment.findOne({ _id: commentId });
    if (!comment) {
      return res.status(400).json({ msg: `no comment with id ${commentId}` });
    }

    const post = await Post.findOne({ _id: postId });

    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }

    post.comments = post.comments.filter(
      (commentator) => commentator.id === req.user.userId
    );

    await post.save();

    comment.comments = comment.comments.filter(
      (commentator) => commentator.id === req.user.userId
    );
    // delete comment
    await comment.save();

    res.status(200).json({ msg: "comment deleted" });
  } catch (err) {
    res.status(500).json({ msg: "something went wrong" });
  }
};

module.exports = {
  getAllComments,
  getUserComments,
  createComment,
  getSingleComment,
  updateComment,
  deleteComment,
};
