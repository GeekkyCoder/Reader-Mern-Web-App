const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    blogPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  });

module.exports = mongoose.model("notification", notificationSchema);
