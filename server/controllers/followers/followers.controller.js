const { isValidObjectId } = require("mongoose")
const Follower = require("../../modals/followers/followers.modal")
const User = require("../../modals/users/users.modal")

const createFollower = async (req, res) => {
    try {
      const { followerId } = req.body;

      const userId = req.user.userId

    //   console.log(req.user)
  
      // Check if the user and follower exist
      const user = await User.findById(userId);
      const follower = await User.findById(followerId);

    //   console.log(user)

      if (!user || !follower) {
        return res.status(404).json({ error: 'User or follower not found' });
      }

      const isFollowing = user.followers.some((follower) => follower.id.toString() === followerId)
    
  
      if (isFollowing) {
        return res.status(400).json({ error: 'Follower already exists' });
      }
  
      // Create a new follower object for User schema
      const newFollower = {
        id: follower._id.toString(),
        name: follower.name,
        email: follower.email,
        bio: follower.bio || ''
      };
  
      // Update the followers array in the User schema
      user.followers.push(newFollower);
      await user.save();
  
      // Create a new follower object for Follower schema
  
      // Find the existing Follower document or create a new one
      let followerDoc = await Follower.findOne({ user: user._id });
  
      if (!followerDoc) {
        followerDoc = new Follower({ user: user._id });
      }
  
      // Add the new follower to the followers array in the Follower schema
      followerDoc.followers.push(newFollower);
      await followerDoc.save();
  
      res.status(200).json({users:followerDoc.followers,follower:follower.name });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

const deleteFollower = async (req,res) => {
    const {id:followerId} = req.params
    
    const userId = req.user.userId
    
    try{
        const user = await User.findById(userId)
        const follower = await User.findById(followerId) 

        // console.log(user)
        // console.log(follower)

        if(!user || !follower){
            return res.status(404).json({msg:"no user and follower found"})
        }

        // removing the follower from user's
       user.followers =  user.followers.filter(follower => follower.id !== followerId)
        await user.save()

        // removing the follower from follower
        let followerDoc = await Follower.findOne({ user: userId });

        followerDoc.followers =  followerDoc.followers.filter(follower => follower.id !== followerId)

        await followerDoc.save()
     
        res.status(200).json({msg:`unfollowed ${follower.name}`})
    }catch(err){
        res.status(500).json({msg:err.message})
    }
 
}


module.exports = {
    createFollower,
    deleteFollower
}