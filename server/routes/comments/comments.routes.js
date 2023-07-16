const { getAllComments, getUserComments, createComment, updateComment, deleteComment, getSingleComment } = require("../../controllers/comments/comments.controller")
const authMiddleware = require("../../middlewares/authMiddleware")

const commentRouter = require("express").Router()

commentRouter.get('/allComments', getAllComments)
commentRouter.get('/',  authMiddleware,getUserComments)
commentRouter.get("/:id", getSingleComment)
commentRouter.post("/createComment", authMiddleware, createComment)
commentRouter.patch("/:id", authMiddleware,updateComment)
commentRouter.delete("/", authMiddleware,deleteComment)

module.exports = commentRouter