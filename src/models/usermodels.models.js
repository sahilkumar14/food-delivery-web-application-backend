import mongoose from "../config/connection.Db.js";



const userSchema = new mongoose.Schema({
    name:String,
    email:{
        type:String,
        unique:true},
    password:String
})
export default mongoose.model("User",userSchema);