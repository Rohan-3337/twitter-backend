
import jwt from "jsonwebtoken";

export const generateTokenAndSetCookies =async function(userId){
    try {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
            expiresIn: "15d",
        });
        
        
 
        return token; 
        
    } catch (error) {
        next(error);
    }
}