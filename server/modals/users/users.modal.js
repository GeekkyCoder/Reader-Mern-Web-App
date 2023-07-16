const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "plz prvide name"],
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    required: [true, "plz prvide email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "plz provide valid email address",
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "plz prvide password"],
    minlength: 6,
  },
  confirmPassword: {
    type: String,
    required: [true, "plz provide confirm Password"],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  verificationToken: String,
  isVerified: {
    type: Boolean,
    default: true,
  },
  verified: Date,
  // passwordToken: {
  //   type: String,
  // },
  socials: [
    {
      meta: {
        type: String,
        default: "",
      },
      linkdein: {
        type: String,
        default: "",
      },
      github: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
    },
  ],
  posts: [
    {
      title: {
        type: String,
      },
      description: {
        type: String,
      },
      image: {
        type: String,
      },
      likes: {
        type: Number,
      },
      tags: {
        type: String,
      },
    },
  ],
  followers: [
    {
      id: {
        type: mongoose.Types.ObjectId,
        ref: "follower",
      },
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      bio: {
        type: String,
        default: "",
      },
      profileImage: {
        type: String,
        default: "https://svgsilh.com/svg/659651.svg",
      },
    },
  ],
  bio: {
    type: String,
    default: "",
  },
  profileImage: {
    type: String,
    default: "https://svgsilh.com/svg/659651.svg",
  },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
});

// userSchema.methods.createJWT = function () {
//   return jwt.sign(
//     { userId: this._id, name: this.name,role: this.role },
//     process.env.SECRET_KEY,
//     { expiresIn: process.env.JWT_LIFETIME }
//   );
// };

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// userSchema.pre("save", function(){
//   console.log(this.markModified('followers'))
// })

module.exports = mongoose.model("user", userSchema);
