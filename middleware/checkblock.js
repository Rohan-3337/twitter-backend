import User from "../models/user.model.js";

const isblocked =async(req,res,next) => {
    try {
        const userId = req.user._id;
        const id = req.params.id;
        const user = await User.findById(id);
        const isblocked = user?.blockedUser.includes(userId);
        if (isblocked) {
            return res.status(403).json({message:"you Blocked user"});

        }
        next();
        
        

        

    } catch (error) {
        next();
        return res.status(500).json({error:error.message});

    }
};

export default isblocked;