import mongoose from "../config/connection.Db.js";



const userSchema = new mongoose.Schema({
    name:{
        type:String,
        minLength:[3,"add proper name"],
        maxLength:[15,"add proper name"]
    },
    email:{
        type:String,
        unique:true,
        minLength:[13,"add proper email"],
        maxLength:[200,"add proper email"]
    },

    password:{
            type:String,
            required:true,
            match:[
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
            ]
    },
    mob:{
        type:String,
        require:true,
        minLength:[10],
        maxLength:[12]
    },
    dob:{type:Date,
        require:true,
        trim:true
    },
    address:String
})
export default mongoose.model("User",userSchema);