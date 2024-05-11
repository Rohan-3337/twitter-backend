import express from 'express';
import { ProtectedRoute } from '../middleware/protectedroute.js';

import { AllPost, CommentonPost, CreatePost, DeletePost, getFollowingPosts, getLikedPosts, getUserPosts, likeUnlikePost } from '../controllers/post.controller.js';

const router = express.Router();


router.post("/create",ProtectedRoute,CreatePost);
router.delete("/delete/:id",ProtectedRoute,DeletePost);
router.post("/comment/:id",ProtectedRoute,CommentonPost);
router.get("/like/:id",ProtectedRoute,likeUnlikePost);
router.get("/all",ProtectedRoute,AllPost);
router.get("/following",ProtectedRoute,getFollowingPosts);
router.get("/likepost/:id",ProtectedRoute,getLikedPosts);
router.get("/user/:id",ProtectedRoute,getUserPosts);


export default router;