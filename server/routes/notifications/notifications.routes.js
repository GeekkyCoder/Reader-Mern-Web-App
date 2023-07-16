const authMiddleware = require("../../middlewares/authMiddleware")
const { getAllUserNotifications, markAsReadController, markAsUnReadController } = require("../../controllers/notifications/notifications.controller")

const notificationRouter = require("express").Router()

notificationRouter.get("/", authMiddleware, getAllUserNotifications)
notificationRouter.post("/markAsRead", authMiddleware, markAsReadController)
notificationRouter.post("/markAsUnread", authMiddleware, markAsUnReadController)

module.exports = notificationRouter