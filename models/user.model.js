import mongoose, { Schema, Types } from "mongoose";


const UserSchema = new Schema({
    username:{
        type:String,
        unique:true,
        required:true
    },
    fullName:{
        type:String,
        
        required:true
    },
    password:{
        type:String,
        minLength:6,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    followers:[{
        type : mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:[],
    }],
    following:[{
        type : mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:[],
    }],
    profileImg:{
        type:String,
        default:"",
    },
    coverImg:{
        type:String,
        default:"",
    },
    bio:{
        type:String,
        default:"",
    },
    link:{
        type:String,
        default:"",
    },
    likedPosts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post",
            default:[],

        }
    ]
},{timestamps: true});


const User = mongoose.model("User",UserSchema);
export default User;