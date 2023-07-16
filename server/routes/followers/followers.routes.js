const { createFollower, deleteFollower } = require("../../controllers/followers/followers.controller")
const authMiddleware = require("../../middlewares/authMiddleware")

const followerRouter = require("express").Router()

followerRouter.post("/", authMiddleware, createFollower)
followerRouter.delete("/:id", authMiddleware, deleteFollower)

module.exports = followerRouter
