import Restaurant from "../models/restaurant.models.js";
import { getCoordinates } from "../utils/geocode.utils.js";
import { getDistance } from "../utils/distance.utils.js";
import { StatusCodes } from "http-status-pro-js";

export async function getNearbyRestaurants(req, res) {
    try {
        const { location } = req.params;

        const userCoords = await getCoordinates(location);
        

        const restaurants = await Restaurant.find();

        let result = [];

        for (let r of restaurants) {

            const restCoords = await getCoordinates(r.location);

            const distance = getDistance(
                userCoords.lat,
                userCoords.lng,
                restCoords.lat,
                restCoords.lng
            );


            

            if (distance <=15) {
                // result.push({
                //     ...r._doc,
                //     distance: distance.toFixed(2) + " km"
                // });

                 result.push({
                name: r.name,
                distance: distance.toFixed(2) + " km"
            });
            }
        }
        if (result.length === 0) {
            return res.status(StatusCodes.OK.code).json({
                code: StatusCodes.OK.code,
                message: "No restaurants found within a 15km radius of this location.",
                data: []
            });
        }

        result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

        console.log("distance of restaurant ",result)
        return res.status(StatusCodes.OK.code).json({
            code: StatusCodes.OK.code,
            message: StatusCodes.OK.message,
            data: result
        });

    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}