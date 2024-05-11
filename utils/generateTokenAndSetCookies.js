import jwt from "jsonwebtoken";

export const generateTokenAndSetCookies =(userId,res)=>{
    try {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
            expiresIn: "15d",
        });
    
        res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, 
		httpOnly: true,
        sameSite: "strict",
		secure: true,

		
		
            
            
        });
    } catch (error) {
        console.error(error);
    }
}