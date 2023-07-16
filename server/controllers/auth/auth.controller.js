const crypto = require("crypto");

const User = require("../../modals/users/users.modal");
const Post = require("../../modals/blogs/blog.modal");

const Token = require("../../modals/token/token.modal");

const cloudinary = require("cloudinary").v2;
const fs = require("fs");
// const { UnauthenticatedError, BadRequestError } = require("../../errors");
const { attachCookiesToResponse } = require("../../utils/utils");
const sendVerificationEmail = require("../../utils/sendVerificationEmail");

const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password) {
    return res
      .status(401)
      .json({ msg: "please provide name email and password" });
  }
  try {
    const userAlreadyExist = await User.findOne({ email });

    if (userAlreadyExist) {
      // return res.status(404).json({ msg: "email already registered" });
      return res.status(404).json({ msg: "user already exist" });
    }

    if (password !== confirmPassword) {
      return res.status(401).json({ msg: "password does not match" });
    }

    const role = (await User.countDocuments({})) === 0 ? "admin" : "user";

    const verificationToken = crypto.randomBytes(40).toString("hex");

    const user = await User.create({
      name,
      email,
      password,
      confirmPassword,
      role,
      verificationToken,
    });

    // frontend origin
    // const origin = "https://reader-blogs.onrender.com";
    const origin = "https://reader-blogs.onrender.com";

    // const tempOrigin = req.get('origin');
    // const protocol = req.protocol;
    // const host = req.get('host');
    // const forwardedHost = req.get('x-forwarded-host');
    // const forwardedProtocol = req.get('x-forwarded-proto');

    await sendVerificationEmail({
      name: user.name,
      email: user.email,
      verificationToken: user.verificationToken,
      origin,
    });

    res.status(201).json({
      msg: "Success! Please check your email to verify account",
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }

  // const tokenUser = {
  //   userId: user._id,
  //   name: user.name,
  //   email: user.email,
  //   bio: user.bio,
  //   profileImage: user.profileImage,
  //   role: user.role,
  //   followers: user.followers,
  // };

  // attachCookiesToResponse(res, tokenUser);
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ msg: "Verification Failed" });
  }

  if (user.verificationToken !== verificationToken) {
    return res.status(401).json({ msg: "Verification Failed" });
  }

  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = "";

  await user.save();

  res.status(200).json({ msg: "Email Verified" });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(404).json({ msg: "please provide password and email" });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ msg: "Invalid Credentials" });
    }

    // compare password

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(404).json({ msg: "wrong password" });
    }

    if (!user.isVerified) {
      return res.status(404).json({ msg: "Please verify your email" });
    }

    const tokenUser = {
      userId: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage,
      role: user.role,
      followers: user.followers,
    };

    // create refresh token
    let refreshToken = "";
    // check for existing token
    const existingToken = await Token.findOne({ user: user._id });

    if (existingToken) {
      const { isValid } = existingToken;

      if (!isValid) {
        return res.status(401).json({ msg: "Invalid Credentials" });
      }

      refreshToken = existingToken.refreshToken;

      attachCookiesToResponse({ res, user: tokenUser, refreshToken });
      return;
    }

    refreshToken = crypto.randomBytes(40).toString("hex");
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;
    const userToken = { refreshToken, ip, userAgent, user: user._id };

    await Token.create(userToken);

    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
  } catch (err) {
    console.log(`err:${err}`);
    res.status(500).json({ msg: err.message });
  }
};

const logOut = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(200).json("logged out successfully!");
};

const getCurrentUser = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await User.findOne(
      { _id: userId },
      { password: 0, confirmPassword: 0 }
    );

    if (!user) {
      // return res.status(404).json({msg:"user not found"})
      return res.status(401).json({ msg: "user not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const getAllUsers = async (req, res) => {
  let allUsers = await User.find({}, { password: 0, confirmPassword: 0 });
  const currentUserFollowers = await User.findOne({ _id: req.user.userId });
  const followerIds = currentUserFollowers?.followers?.map((follower) =>
    follower.id.toString()
  );

  allUsers = allUsers.filter(user => user._id.toString() !== req.user.userId)
  // Filtering out the users that the current user is following
  const usersNotFollowing = allUsers.filter(
    (user) => !followerIds.includes(user._id.toString())
  );
  res.status(200).json({ users: usersNotFollowing });
};

const getSingleUser = async (req, res) => {
  const { userId } = req.query;

  try {
    const user = await User.findOne({ _id: userId });
    if(!user){
      return res.status(404).json({msg:"user not found"})
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const updateUser = async (req, res) => {
  // console.log(req.user);
  // console.log(req.body);

  const { name } = req.body;

  if (!name) {
    return res.status(404).json({ msg: "plz provide all values" });
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    const tokenUser = {
      userId: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      profileImage: updatedUser.profileImage,
      role: updatedUser.role,
      followers: updatedUser.followers,
      socials: updateUser.socials,
    };

    await Post.updateMany(
      { createdBy: req.user.userId },
      {
        $set: {
          bio: updatedUser.bio,
          name: updatedUser.name,
          profileImage: updatedUser.profileImage,
          socials: updateUser.socials,
        },
      }
    );

    const refreshToken = crypto.randomBytes(40).toString("hex");

    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const uploadUserProfileImage = async (req, res) => {
  const userId = req.user.userId;

  const tempImagePath = req.files?.image?.tempFilePath;
  const options = {
    user_filename: true,
    folder: "reader-blog-web-app-uploads",
  };

  try {
    const result = await cloudinary.uploader.upload(tempImagePath, options);

    if (result.format === "pdf") {
      return res
        .status(400)
        .json({ msg: "image must be in png,jpeg,jpg format" });
    }

    if (!result.resource_type.startsWith("image")) {
      return res
        .status(400)
        .json({ msg: "image must be in png,jpeg,jpg format" });
    }

    if (result.bytes > 1024 * 1024) {
      return res
        .status(400)
        .json({ msg: "image must be less than or equal to 1mb in size" });
    }

    // after uploading image to the server removing temp image from temp folder
    fs.unlinkSync(tempImagePath);
    const user = await User.findOne({ _id: userId });
    user.profileImage = result.url;
    await user.save();
    res.status(201).json({ msg: "image uploaded successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  register,
  login,
  logOut,
  updateUser,
  getCurrentUser,
  uploadUserProfileImage,
  verifyEmail,
  getAllUsers,
  getSingleUser,
};
