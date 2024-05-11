import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import {v2 as cloudinary} from "cloudinary"
import Notification from "../models/notification.model.js";

export const CreatePost = async(req,res)=>{
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user)return res.status(404).json({error:"User not found"});

        if(!text && !img) return res.status(400).json({error:"text or img is must be required"});
        if(img){
            const uploadresponse = await cloudinary.uploader.upload(img);
            
            img = uploadresponse.secure_url;

        }
        const newPost = await Post({
            user:userId,
            text,
            img,
        });
        await newPost.save();
        return res.status(200).json({message:"Post saved successfully",newPost});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:`${error.message}`});
    }
}

export const DeletePost = async(req,res) => {
    try {
        const {id} =req.params;
        const post = await Post.findById(id);
        if(!post){
            return res.status(404).json({message:"Post not found",});
        }
        if(post.user.toString()!==req.user._id.toString()){
            return res.status(400).json({message:"UnAuthorized accesss",});
        }
        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
        }
        const deletePost = await Post.findByIdAndDelete(id);

        return res.status(200).json({message:"Post deleted successfully",deletePost});

    } catch (error) {
        console.log(error);
        return res.status(500).json({error:`${error.message}`});
    }
};

export const CommentonPost = async (req,res)=>{
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        if(!text) return res.status(400).json({message:"text field is required"});
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:"Post not found"});
        const comment = {user:userId,text,};
        post.comments.push(comment);
        await post.save();
        return res.status(200).json({message:"Comment successfully",post});

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:`${error.message}`});
    }
};

export const likeUnlikePost = async (req, res) => {
    try {
        const userId= req.user._id;
        const {id:postId} = req.params;
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({message:"Post not found"});

        }
        const userLikePost = post.likes.includes(userId);
        
        if(userLikePost){
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
            const updateLikes = post.likes.filter((id)=>id.toString()!==userId.toString());
            
            return res.status(200).json({message:"unLike the Post",updateLikes});

        }else{
            post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

            const notification = new Notification({
                from: userId,
                to:post.user,
                type:'like'
            })
            await notification.save();
            const updateLikes = post.likes;
            
            
            return res.status(200).json({message:"Post liked successfully",updateLikes});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:`${error.message}`});
    }
};


export const AllPost = async(req, res) => {
    try {
    
        const post = await Post.find().sort({createdAt:-1}).populate({path:"user",select:"-password"}).populate({path:"comments.user"});
        if(post.length ===0){
            return res.status(200).json([]);
        }
        return res.status(200).json({message:"fetched successfully",post});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:`${error.message}`});
    }
};


export const getLikedPosts = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({message:"User not found"});
        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		return res.status(200).json({message:"fetched successfully",likedPosts});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:`${error.message}`});
    }
};

export const getFollowingPosts = async(req,res)=>{
    try {
        const userId= req.user._id;
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({message:"User not found"});
        const following = user.following;
        const followingFeed = await Post.find({user:{$in:following}}).sort({createdAt:-1})
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        });
        return res.status(200).json({message:"fetched successfully",followingFeed});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:`${error.message}`});
    }
}

export const getUserPosts = async (req, res) => {
	try {
        const userId = req.user._id;
		const { id } = req.params;

		const user = await User.findById(id);
        const isblocked = user.blockedUser.includes(userId);
        if (isblocked) {
            return res.status(403).json({message:"you Blocked user"});

        }
		if (!user) return res.status(404).json({ error: "User not found" });

		const post = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json({message:"Successfully",post});
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};