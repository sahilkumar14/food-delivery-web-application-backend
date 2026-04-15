import mongoose from "../config/connection.Db.js";

const coordinatesSchema = new mongoose.Schema({
    lat: Number,
    lng: Number
}, { _id: false });

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
    address:String,
    addressCoordinates: {
        type: coordinatesSchema,
        default: null
    }
})
export default mongoose.model("User",userSchema);
