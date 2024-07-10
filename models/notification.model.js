import mongoose, { Schema } from "mongoose";



const NotificationSchema = new Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true  
    },
    type:{
        type:String,
        enum:['follow','like','comment','new post','retweet'], 
        required:true
    },
    read:{
        type:Boolean,
        default:false,

    }

},{timestamps:true});

const Notification = mongoose.model("Notification",NotificationSchema);
export default Notification;