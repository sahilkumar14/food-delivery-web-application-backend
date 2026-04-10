
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
const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    menu: {
        type: [categorySchema],
        required: true
    }
});

// Export Model
export default mongoose.model("Restaurant", restaurantSchema);