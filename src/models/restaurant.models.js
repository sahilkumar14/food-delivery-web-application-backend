
import mongoose from "../config/connection.Db.js";

// item Schema
const itemSchema = new mongoose.Schema({
    itemName: String,
    price: Number,
    description: String
});

// Category Schema
const categorySchema = new mongoose.Schema({
    category: String,
    items: [itemSchema]
});

// Restaurant Schema
const coordinatesSchema = new mongoose.Schema({
    lat: Number,
    lng: Number
}, { _id: false });

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
       
    },
    email: { type: String, unique: true },
    password:{type:String,unique:true,match:[
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
            ]},
    location: {
        type: String,
    },
    locationCoordinates: {
        type: coordinatesSchema,
        default: null
    },
    menu: {
        type: [categorySchema],
        required: true,
        default:[]
        
    }
});

// Export Model
export default mongoose.model("Restaurant", restaurantSchema);
