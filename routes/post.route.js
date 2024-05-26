import express from 'express';
import { ProtectedRoute } from '../middleware/protectedroute.js';

import { AllPost, CommentonPost, CreatePost, DeletePost, getFollowingPosts, getLikedPosts, getUserPosts, likeUnlikePost } from '../controllers/post.controller.js';
import isblocked from '../middleware/checkblock.js';

const router = express.Router();


router.post("/create",ProtectedRoute,CreatePost);
router.delete("/delete/:id",ProtectedRoute,DeletePost);
router.post("/comment/:id",ProtectedRoute,CommentonPost);
router.get("/like/:id",ProtectedRoute,isblocked,likeUnlikePost);
router.get("/all",ProtectedRoute,AllPost);
router.get("/following",ProtectedRoute,isblocked,getFollowingPosts);
router.get("/likepost/:id",ProtectedRoute,isblocked,getLikedPosts);
router.get("/user/:id",ProtectedRoute,isblocked,getUserPosts);


export default router;