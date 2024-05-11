import express from 'express';
import { ProtectedRoute } from '../middleware/protectedroute.js';
import { deleteAllNotifications, deleteNotification, getNotification } from '../controllers/notification.controller.js';

const router = express.Router();
router.get('/',ProtectedRoute,getNotification);
router.delete("/delete",ProtectedRoute,deleteAllNotifications);
router.delete("/delete/:id",ProtectedRoute,deleteNotification);


export default router;