import express from 'express';
import { ProtectedRoute } from '../middleware/protectedroute.js';
import { SaveUnsavePost, allBlockedUser, blockedUserbyId, followUser, followers, following, getProfile, getSave, getSuggestedUsers, updateUser} from '../controllers/user.controller.js';
import isblocked from '../middleware/checkblock.js';

 const router  = express.Router();
router.get("/profile/:id",ProtectedRoute,isblocked,getProfile);
router.get("/follow/:id",ProtectedRoute,followUser);
router.get("/suggested",ProtectedRoute,getSuggestedUsers); 
router.get("/blockedusers",ProtectedRoute,allBlockedUser);
router.get("/get-save",ProtectedRoute,getSave);
router.post("/followers/:id",ProtectedRoute,followers); 
router.post("/following/:id",ProtectedRoute,following);
router.put("/update",ProtectedRoute,updateUser);
router.put("/save/:id",ProtectedRoute,SaveUnsavePost);
router.put("/blocked/:id",ProtectedRoute,blockedUserbyId);

export default router;