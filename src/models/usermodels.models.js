import mongoose from "../config/connection.Db.js";



const userSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true},
    password:{
            type:String,
            required:true,
            match:[
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
            ]
  },
    address:String
})
export default mongoose.model("User",userSchema);