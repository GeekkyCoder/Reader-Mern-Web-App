const mongoose = require("mongoose")

const followersSchema = new mongoose.Schema({
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'user',
      required: [true, "user required"]
    },
    followers: [{
      id: {
        type: String,
      },
      profileImage:{
       type:String,
       default:"https://svgsilh.com/svg/659651.svg"
      },
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      bio:{
        type:String ,
        default:'',
      }
    }]
  });

  module.exports = mongoose.model("follower", followersSchema)