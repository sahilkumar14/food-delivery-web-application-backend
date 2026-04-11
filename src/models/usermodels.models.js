import mongoose from "../config/connection.Db.js";

const userSchema = new mongoose.Schema({
    name:String,
    email:{
        type:String,
        unique:true},
    password:String,
    role: {
        type: String,
        enum: ['customer', 'restaurant', 'agent'],
        default: 'customer'
    }
}, { timestamps: true })

export default mongoose.model("User",userSchema);