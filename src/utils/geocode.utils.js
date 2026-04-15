import axios from "axios";
import LocationCache from "../models/location.models.js"
import dotenv from "dotenv";

dotenv.config();

export async function getCoordinates(place) {

    let cached = await LocationCache.findOne({ place });

    if (cached) {
        return { lat: cached.lat, lng: cached.lng };
    }

    const res = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${place}&key=${process.env.GEOCODE_KEY}`
    );

    const data = res.data.results[0].geometry;
    

    await LocationCache.create({
        place,
        lat: data.lat,
        lng: data.lng
    });

    return {
        lat: data.lat,
        lng: data.lng
    };
}