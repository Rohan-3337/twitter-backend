import express from 'express';
import { ProtectedRoute } from '../middleware/protectedroute.js';
import { followUser, getProfile, getSuggestedUsers, updateUser} from '../controllers/user.controller.js';

 const router  = express.Router();
router.get("/profile/:id",ProtectedRoute,getProfile);
router.get("/follow/:id",ProtectedRoute,followUser);
router.get("/suggested",ProtectedRoute,getSuggestedUsers); 
router.put("/update",ProtectedRoute,updateUser);

export default router;