const mongoose = require("mongoose")

const commentsSchema = new mongoose.Schema({
    post: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    comments: [{
      id: {
        type: mongoose.Types.ObjectId,
        ref:'User',
        required:[true,'please provide user id']
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
  });


  module.exports = mongoose.model('comment', commentsSchema)