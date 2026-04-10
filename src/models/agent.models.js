import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true, 
        unique: true 
    },
    isOnline: { 
        type: Boolean, 
        default: false 
    },
    currentLocation: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    }
}, { timestamps: true });

export default mongoose.model("DeliveryAgent", agentSchema);