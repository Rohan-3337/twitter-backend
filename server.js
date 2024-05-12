import express from "express";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoute from "./routes/notification.route.js";
import { configDotenv } from "dotenv";
import Connectdb from "./DB/Connectdb.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";

configDotenv({path:"./.env"});
const app = express();
app.use(cookieParser());
app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({extended: false,limit:"5mb"}))
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});
if (process.env.NODE_ENV === "development"){
	app.use(
	  cors({
		origin: "http://localhost:3000",
		credentials: true,
	  })
	);
  }
  
  
	app.use(
	  cors({
		origin: "*",
		credentials: true,
	  })
	);
  


const Port = process.env.PORT || 5000;
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/post",postRoutes);
app.use("/api/notification",notificationRoute);

app.listen(Port,async()=>{
    console.log(`server listening on ${Port}`);
	
	
})
Connectdb();