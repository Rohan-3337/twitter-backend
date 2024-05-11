import mongoose from "mongoose";

 const Connectdb = async()=>{
    try {
       const conn =  await mongoose.connect(process.env.MONGODB_URI);
       console.log(`db connection ${conn.connection.host}`);
    } catch (error) {
        console.error(error);
    }
}

export default Connectdb;