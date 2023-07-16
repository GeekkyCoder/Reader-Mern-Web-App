const Notification = require("../../modals/notifications/notifications.modal");

const getAllUserNotifications = async (req, res) => {
  try {
    const notifcations = await Notification.find({
      recipient: req.user.userId,
      isRead: false,
    });
    res.status(200).json({ notifcations, count: notifcations.length });
  } catch (err) {
    res.status(500).json({ msg: "something went wrong" });
  }
};

const markAsReadController = async (req, res) => {
  const { id, sender } = req.body;

  try {
    const notification = await Notification.findOne({ _id: id, sender });

    if (!notification) {
      return res.status(404).json({ msg: "notification not found" });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({ msg: "marked as view" });
  } catch (err) {
    res.status(500).json({ msg: "something went wrong" });
  }
};

const markAsUnReadController = async (req,res) => {
    const {id,sender} = req.body 
    try {
        const notification = await Notification.findOne({ _id: id, sender });
    
        if (!notification) {
          return res.status(404).json({ msg: "notification not found" });
        }
    
        notification.isRead = false;
    
        await notification.save();
    
        res.status(200).json({ msg: "marked as unread" });
      } catch (err) {
        res.status(500).json({ msg: "something went wrong" });
      }
}

module.exports = {
  getAllUserNotifications,
  markAsReadController,
  markAsUnReadController
};
