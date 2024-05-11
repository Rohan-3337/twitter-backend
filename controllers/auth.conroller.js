import User from "../models/user.model.js";
import bcryptjs from "bcryptjs"
import { generateTokenAndSetCookies } from "../utils/generateTokenAndSetCookies.js";

export const singup =async (req,res)=>{
    
    try {
        const {username,email,fullName,password} = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({error: 'Invalid email'});
        }
        const existinguser = await User.findOne({username});
        
        if(existinguser){
            return res.status(400).json({error: 'Username is already taken'});
        }
        const existingemail = await User.findOne({email});
        if(existingemail){
            return res.status(400).json({error: 'Email is already taken'});
        }
        if(password.length < 6){
            return res.status(403).json({error: 'Password must be at least 6 characters'});
        }
//hash password
        const salt = await bcryptjs.genSalt(10);
        const hashpassword = await bcryptjs.hash(password, salt);
        const newUser = new User({
            username,fullName,email,password:hashpassword
        });
        if(newUser){
            generateTokenAndSetCookies(newUser._id,res);
            console.log(req.cookies)
            
            await newUser.save();
            
            return res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                coverImg: newUser.coverImg,
                fullName: newUser.fullName,
                link:newUser.link,
                followers: newUser.followers,
                following: newUser.following,
                email: newUser.email,
                bio: newUser.bio

            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({error:`${error.message}`});
    }
}

export const login =async (req,res)=>{
    try {
        const {username,password} = req.body;
        const user = await User.findOne({username: username});
        const isPassword = bcryptjs.compare(password, user?.password || "");
        if(!user || !isPassword){
            return res.status(401).json({error:"Invalid password or username"});
        }
        generateTokenAndSetCookies(user._id,res);
            
            
            return res.status(200).json({
                _id: user._id,
                username: user.username,
                coverImg: user.coverImg,
                fullName: user.fullName,
                link:user.link,
                followers: user.followers,
                following: user.following,
                email: user.email,
                bio: user.bio

            })


    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error:`${error.message}`});
    }
}

export const logout=async (req,res)=>{
    try {
        res.clearCookie('jwt');
        return res.status(200).json({message:`logout successfully`});
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error:`${error.message}`});
    }
}

export const getProfile = async(req, res) =>{
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        return res.status(200).json({message:"user is found",user});

        
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({error:`${error.message}`});
    }
}