const { register, login, updateUser, uploadUserProfileImage, getCurrentUser, logOut, verifyEmail, getAllUsers, getSingleUser } = require("../../controllers/auth/auth.controller");
const authMiddleware = require("../../middlewares/authMiddleware");

const authRouter = require("express").Router()

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.delete('/logout', authMiddleware,logOut)
authRouter.post('/verify-email', verifyEmail)
authRouter.patch("/updateuser", authMiddleware, updateUser);
authRouter.post("/uploadUserProfileImage", authMiddleware, uploadUserProfileImage)
authRouter.get("/currentUser", authMiddleware, getCurrentUser)
authRouter.get("/user", getSingleUser)
authRouter.get("/users", authMiddleware, getAllUsers)

module.exports = authRouter