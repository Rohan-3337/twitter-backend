import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getProfile= async (req, res) =>{
    try {
        const {id} = req.params;
        const user = await User.findById(id).select("-password");
        if(!user){
            return res.status(404).json({message: "User not found"});

        }
        return res.json({message:"user find successfully",user});

        
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

		const usersFollowedByMe = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{ $sample: { size: 10 } },
		]);

		
		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));
        console.log(suggestedUsers,"Run suggested user"); 
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