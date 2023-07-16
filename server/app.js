const express = require("express");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const path = require("path");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const mongoose = require("mongoose")
// require("express-async-errors");
const cors = require("cors");
const helmet = require("helmet");
const rateLimiter = require("express-rate-limit");
const mongooseSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth/auth.routes");
const blogRouter = require("./routes/blogs/blogs.routes");
const mongoConnect = require("./db/mongoConnect");
const commentRouter = require("./routes/comments/comments.routes");
const followerRouter = require("./routes/followers/followers.routes");
const notificationRouter = require("./routes/notifications/notifications.routes");
const saveRouter = require("./routes/save/save.router");

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// security
app.use(
  rateLimiter({
    windowMs: 2 * 60 * 1000,
    max: 60,
  })
);
app.set("trust proxy", 1);
app.use(cookieParser(process.env.JWT_SECRET));
app.use(helmet());
app.use(mongooseSanitize());

app.use(morgan("tiny"));
app.use(express.json());
app.use(cors({
  origin:"https://reader-blogs.onrender.com",
  credentials:true
}));
app.use(fileUpload({ useTempFiles: true }));

app.get("/", (req, res) => {
  res.send("hello world");
});

//routes
app.use("/api/v1/posts", blogRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/followers", followerRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/save", saveRouter);



// app.use(notFoundMiddleware);
// app.use(errorHandlerMiddleware);

// app.use(express.static(path.join(__dirname, "public")));

mongoose.connection.on("open", () => {
  console.log("MongoDB connection ready!")
})

mongoose.connection.on("error", (err) => {
   console.error(`${err}`)
})

async function startServer() {
  try {
    await mongoConnect(MONGO_URL);
    app.listen(8000, () => {
      console.log(`listening at port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
}

startServer();
