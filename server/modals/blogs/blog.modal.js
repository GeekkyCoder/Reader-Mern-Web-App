const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please provide user"],
    },
    profileImage: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      defaut: "",
    },
    title: {
      type: String,
      required: [true, "please provide title"],
    },
    image: {
      type: String,
    },
    description: {
      type: String,
      required: [true, "please provide description"],
    },
    view:{
      type:String,
      enum:['public','private','followers'],
     default:"public"
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
    likes: {
      type: Number,
      default: 0,
    },
    tags: {
      type: String,
      enum: [
        "science",
        "technology",
        "politics",
        "history",
        "health and fitness",
        "coding",
        "general",
      ],
      default: "general",
    },
    isVerfied: {
      type: Boolean,
      default: false,
    },
       comments: [{
      id: {
        type: mongoose.Types.ObjectId,
        ref:'user'
      },
      name: {
        type: String,
      },
      profileImage:{
        type:String,
        default:"https://img.freepik.com/premium-vector/flat-instagram-icons-notifications_619991-50.jpg"
      },
      bio:{
        type:String ,
        default:'',
      },
      content: {
        type: String
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("posts", blogPostSchema);
