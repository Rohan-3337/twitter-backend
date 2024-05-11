import express from 'express';
import { getProfile, login, logout, singup } from '../controllers/auth.conroller.js';
import  {ProtectedRoute}  from '../middleware/protectedroute.js';

const router = express.Router();

router.post('/singup',singup);
router.post('/login',login);
router.post('/logout',logout);
router.get("/myprofile",ProtectedRoute,getProfile);


export default router;