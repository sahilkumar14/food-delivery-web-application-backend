import mongoose from "mongoose";

const locationCacheSchema = new mongoose.Schema({
    place: { type: String, unique: true },
    lat: Number,
    lng: Number
});

export default mongoose.model("LocationCache", locationCacheSchema);