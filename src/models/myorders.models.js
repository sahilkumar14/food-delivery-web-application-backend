import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    restaurantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Restaurant", 
        required: true 
    },
    deliveryAgentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "DeliveryAgent",
        default: null
    },
    items: [
        {
            name: String,
            quantity: Number,
            price: Number
        }
    ],
    totalPrice: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["Pending", "Confirmed", "Out for Delivery", "Delivered", "Cancelled"], 
        default: "Pending" 
    },
    address: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);