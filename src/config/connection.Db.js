import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const url  = process.env.URL;

mongoose.connect(url)
.then(()=>{
    console.log("db connected");
})
.catch((err)=>{
    console.log("connection ",err);
})

export default mongoose;



