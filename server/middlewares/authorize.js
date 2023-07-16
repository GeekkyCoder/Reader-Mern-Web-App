const authorize =  (...roles) => {
    return (req,res,next) => {
        // there can be more roles such as admin,owner etc...
        if(!roles.includes(req.user.role)){
            return res.status(403).json({msg:"not authorized to access this route"})
        }

        next()
    }
}


const checkPermissions = (requestUser,resourceUserId) => {
    if(requestUser.role === "admin") return true 
   //  console.log(requestUser.userId === resourceUserId.toString())
    if(requestUser.userId === resourceUserId) return true 
    return false
 }
 

module.exports = {authorize,checkPermissions}