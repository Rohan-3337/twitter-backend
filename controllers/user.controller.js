import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import {isValidObjectId} from "mongoose"

export const getProfile= async (req, res) =>{
    try {
        const {id} = req.params;
        const {blockedUser} =req.user;
        const user = await User.findById(id).select("-password");
        const post  = await Post.find({user:id});
        
        const isblocked =blockedUser.includes(id);
        if(isblocked){
            return res.status(400).json({message: "you are not allowed to see this profile"});  
        }

        if(!user){
            return res.status(404).json({message: "User not found"});

        }
        return res.status(200).json({msg:"User find successfully",user:{_id: user._id,
            username: user.username,
            coverImg: user.coverImg,
            fullName: user.fullName,
            link:user.link,
            followers: user.followers,
            following: user.following,
            email: user.email,
            bio: user.bio,
            postLength:post.length,
            createdAt: user.createdAt,
            }});

        
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message:`Error: ${error.message}`});
    }
}


export const followUser = async(req,res) => {
    try {
        const {id} =req.params;
        if(id === req.user._id.toString()) {
            return res.status(400).json({message:"you cannot follow yourself"});
        }
        const followId= await User.findById(id);
        const currentUser = await User.findById(req.user._id);
        
        if(!currentUser || !followId){
            return res.status(404).json({message:"user not found"});
        }
        const isFollowing = currentUser.following.includes(id);
        if(isFollowing){
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

            
            return res.status(200).json({message:"user unfollow succesfully"});
        }else{
            await User.findByIdAndUpdate(id,{
                $push:{followers:req.user._id}
            })
            await User.findByIdAndUpdate(req.user._id,{
                $push:{following:id}
            })
            const newNotification = new Notification({
                from:currentUser._id,
                type:"follow",
                to:followId._id,
            })
            await newNotification.save();
            return res.status(200).json({message:"user follow succesfully"});
        }
        
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message:`Error: ${error.message}`});

    }
};

export const getSuggestedUsers = async(req, res) =>{
    try {
        const userId = req.user._id;
        const {_id,blockedUser} = req.user;
        const blockedMeUsers = await User.find({ blockedUser:_id }).select('_id');
        const blockedMeUserIds = blockedMeUsers.map(user => user._id);

        // Combine both arrays of blocked user IDs
        const allBlockedUserIds = [...blockedUser, ...blockedMeUserIds];
		const usersFollowedByMe = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $nin: [...allBlockedUserIds, userId] },
				},
			},
			{ $sample: { size: 10 } },
		]);

		
		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
        
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));
     
        res.status(200).json(suggestedUsers);

    } catch (error) {
        console.error(error);
        return res.status(500).json({message:`Error: ${error}`});
    }
}


export const updateUser = async (req, res) => {
    const {username,fullName,currentPassword,email,newPassword,bio,link} =req.body;
    let {coverImg,profileImg} =req.body;
    const{_id} =req.user;

    try {
        let user = await User.findById(_id);
        if(!user) return res.status(400).json({message:"User not found"});
        if((!newPassword && currentPassword)||(newPassword && !currentPassword)){
            return res.status(400).json({message:"provide both newpassword and currentpassword"});
        }
        if(currentPassword && newPassword){
            const isMatch = await bcryptjs.compare(currentPassword,user.password);
            if(!isMatch) return res.status(400).json({message:"incorrect password"});
            if(newPassword.length < 6){
                return res.status(403).json({error: 'Password must be at least 6 characters'});
            }
            const salt = await bcryptjs.genSalt(10);
            user.password = await bcryptjs.hash(newPassword, salt);
            if(profileImg){
                if (user.profileImg) {
                    // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
                    await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
                }
                const uploadresponse = await cloudinary.uploader.upload(profileImg);
                profileImg = uploadresponse.secure_url;

            }
            if(coverImg){
                if (user.coverImg) {
                    await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
                }
                const uploadresponse = await cloudinary.uploader.upload(coverImg);
                coverImg = uploadresponse.secure_url;

            }
            
        }
        user.fullName = fullName||user.fullName;
            user.email = email||user.email;
            user.username = username||user.username;
            user.bio = bio||user.bio;
            user.link = link||user.link;
            user.profileImg = profileImg||user.profileImg;
            user.coverImg = coverImg||user.coverImg;
            user = await user.save();
            user.password = null;
            
            return res.status(200).json({message:"Succesfully updated",user});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:`Error: ${error}`});
    }
};

export const followers = async(req,res)=>{
    const{id} =req.params;
    console.log(id);
    const {blockedUser,_id} =req.user;
    try {
        const blockedMeUsers = await User.find({ blockedUser:_id }).select('_id');
        const blockedMeUserIds = blockedMeUsers.map(user => user._id);

        // Combine both arrays of blocked user IDs
        const allBlockedUserIds = [...blockedUser, ...blockedMeUserIds];
        const user = await User.findById(id)
            .select("_id username fullName email") 
            .populate({
                path: "followers",
                match:{_id:{$nin:allBlockedUserIds}},
                select: "_id profileImg username fullName"
            });
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        
        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:`Error: ${error}`});
    }
    
}


export const following = async(req,res)=>{
    const{id} =req.params;
    const {blockedUser,_id} =req.user;
    try {
        const blockedMeUsers = await User.find({ blockedUser:_id }).select('_id');
        const blockedMeUserIds = blockedMeUsers.map(user => user._id);

        // Combine both arrays of blocked user IDs
        const allBlockedUserIds = [...blockedUser, ...blockedMeUserIds];
        const user = await User.findById(id)
            .select("_id profileImg username fullName email") 
            .populate({
                path: "following",
                match:{_id:{$nin:allBlockedUserIds}},
                select: "_id profileImg username fullName"
            });
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        
        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:`Error: ${error}`});
    }
    
}


export const blockedUserbyId = async(req,res)=>{
    const {_id,blockedUser} = req.user;
    const {id} = req.params;
    try {
        if(id === req.user._id.toString()) {
            return res.status(400).json({message:"you cannot block yourself"});
        }
        const isblocked = blockedUser.includes(id);
        
        if(isblocked) {
            await User.updateOne({_id},{$pull: {blockedUser:req.params.id}});
            
        
            return res.status(200).json({message:"you unblocked successfully"});
        }else{
             await User.updateOne({_id},{$push: {blockedUser:req.params.id}});
           
            return res.status(200).json({message:"you blocked successfully"});

        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:`${error.message}`});
    }
}

export const allBlockedUser =async(req,res)=>{
    const {_id} = req.user;
    try {
        const check = isValidObjectId(_id);
        const blockUsers = await User.findById(_id).populate({path:"blockedUser",select:"__id profileImg username fullName"}).select("_id profileImg username fullName");
        if(!check) {
            return res.status(404).json({error: 'Not Found'});
        }
        return res.status(200).json(blockUsers);

    } catch (error) {
        console.error(error);
        return res.status(500).json({error:`${error.message}`});
    }
}

export const SaveUnsavePost = async(req,res) =>{
    try {
        const userId = req.user._id;
        const { id: postId } = req.params;
        const post = await Post.findById(postId);

        
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const user = await User.findById(userId);


        const userSavePost = user.savePosts.includes(postId);


        if (userSavePost) {
        
            await User.updateOne({ _id: userId }, { $pull: { savePosts: postId } });
            user.savePosts.pull(postId);

            return res.status(200).json({ message: "Unsave the Post", savePosts:user.savePosts });
        } else {
            user.savePosts.push(postId);

            await User.updateOne({ _id: userId }, { $push: { savePosts: postId } });
            return res.status(200).json({ message: "Save the post successfully", savePosts:user.savePosts });
        }

        
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:`${error.message}`});
    }
}


export const getSave = async(req,res) =>{
    try {
        const {savePosts,_id} = req.user;
        const saveposts = await Post.find({_id:{$in:savePosts}}).populate();
        return res.status(200).json({message:"success",savePosts:saveposts});
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:`${error.message}`});
    }
} 



// implement retweet Function
export const retweet = async(req, res) => {
    try {
        const {user} = req;
        const {id} = req.params;
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({message:"not found"});
        }
        const checkRetweet = user?.retweets?.includes(post?.id);
        if (checkRetweet) {
            await User.updateOne({ _id: user?._id }, { $pull: { retweets: id } });
            user.savePosts.pull(id);
            return res.status(200).json({message:"Remove the retweet post successfully"});
        }else{
            user.retweets.push(id);

            await User.updateOne({ _id: user?._id }, { $push: { retweets: id } });
            return res.status(200).json({ message: "Retweet the post successfully" });
        }
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:`${error.message}`});
    }
}


export const getRetweet = async(req,res) => {
    try {
        const {retweets,_id} = req.user;
        const allretweets = await Post.find({_id:{$in:retweets}}).populate();
        console.log(allretweets);
        return res.status(200).json({message:"success",retweets:allretweets});
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:`${error.message}`});
    }
}