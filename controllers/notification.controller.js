import Notification from "../models/notification.model.js";

export const getNotification = async (req, res) => {
    try {
        const userId = req.user._id;
        const notification =await Notification.find({to:userId}).populate({
            path:"from",
            select:"username profileImg",
        });
        await Notification.updateMany({to:userId},{read:true});
        return res.status(200).json({notification});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:`${error.message}`});
    }
};

export const deleteAllNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		await Notification.deleteMany({ to: userId });

		return res.status(200).json({ message: "Notifications deleted successfully" });
	} catch (error) {
		console.log("Error in deleteNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const deleteNotification = async (req, res) =>{
    try {
        const userId = req.user._id;
        const notificationId = req.params.id;
        const notification = await Notification.findById(notificationId);
        if(!notification){
            return res.status(404).json({ message: "notification not found" });
        }
        if(notification.to.toString() === userId.toString()){
            return res.status(400).json({ message: "you are not allowed to delete this notification" });
        }
        await Notification.findByIdAndDelete(notificationId);
        return res.status(200).json({message:"succefully deleted",notification});
    } catch (error) {
        console.log("Error in deleteNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
};