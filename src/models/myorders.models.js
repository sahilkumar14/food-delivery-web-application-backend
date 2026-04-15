import mongoose from "mongoose";

const coordinatesSchema = new mongoose.Schema({
    lat: Number,
    lng: Number
}, { _id: false });

const locationSnapshotSchema = new mongoose.Schema({
    address: String,
    coordinates: {
        type: coordinatesSchema,
        default: null
    }
}, { _id: false });

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
    rejectedByAgents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryAgent"
        }
    ],
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
        enum: ["Pending", "Confirmed", "Ready for Pickup", "Assigned to Agent", "Picked from Restaurant", "Out for Delivery", "Delivered", "Cancelled"], 
        default: "Pending" 
    },
    address: { 
        type: String, 
        required: true 
    },
    pickupLocation: {
        type: locationSnapshotSchema,
        default: null
    },
    deliveryLocation: {
        type: locationSnapshotSchema,
        default: null
    }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
