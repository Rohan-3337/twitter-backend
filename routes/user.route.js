import express from 'express';
import { ProtectedRoute } from '../middleware/protectedroute.js';
import { allBlockedUser, blockedUserbyId, followUser, followers, following, getProfile, getSuggestedUsers, updateUser} from '../controllers/user.controller.js';
import isblocked from '../middleware/checkblock.js';

 const router  = express.Router();
router.get("/profile/:id",ProtectedRoute,isblocked,getProfile);
router.get("/follow/:id",ProtectedRoute,followUser);
router.get("/suggested",ProtectedRoute,getSuggestedUsers); 
router.get("/blockedusers",ProtectedRoute,allBlockedUser);
router.post("/followers/:id",ProtectedRoute,followers); 
router.post("/following/:id",ProtectedRoute,following);
router.put("/update",ProtectedRoute,updateUser);
router.put("/blocked/:id",ProtectedRoute,blockedUserbyId);

export default router;