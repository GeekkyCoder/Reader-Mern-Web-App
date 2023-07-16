const {createSavePost, getUserSavedPosts, unSaveSavedPost} = require("../../controllers/save/save.controller")
const authMiddleware = require("../../middlewares/authMiddleware")

const saveRouter = require("express").Router()

saveRouter.post('/createSave',authMiddleware, createSavePost)
saveRouter.get('/', authMiddleware, getUserSavedPosts)
saveRouter.delete('/', authMiddleware, unSaveSavedPost)

module.exports = saveRouter