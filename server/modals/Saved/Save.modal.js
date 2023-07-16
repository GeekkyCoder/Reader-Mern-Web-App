const mongoose = require("mongoose");

const saveSchema = new mongoose.Schema({
    savedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    postUser:{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      }, 
      name: {
        type: String,
      },
      bio: {
        type: String,
      },
      profileImage: {
        type: String,
      },
      role: {
        type: String,
      },
    },
  post:
    {
      _id: {
        type: mongoose.Types.ObjectId,
        ref: "post",
      },
      title: {
        type: String,
      },
      description: {
        type: String,
      },
      image: {
        type: String,
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
      },
      likes:{
        type:Number
      },
      view: {
        type: String,
      },
      isVerified: {
        type: Boolean,
      },
      createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
      }
    },
});

module.exports = mongoose.model("save", saveSchema);
