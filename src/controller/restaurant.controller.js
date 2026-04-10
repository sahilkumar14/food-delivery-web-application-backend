import { StatusCodes } from "http-status-pro-js";
import Restaurant from "../models/restaurant.models.js";

async function createRestorant(req, res) {
    const { name, location, menu } = req.body;

    try {
        let existingRestaurant = await Restaurant.findOne({ name: name });

        if (existingRestaurant) {
            if (Array.isArray(menu)) {
                existingRestaurant.menu.push(...menu);
            } else {
                existingRestaurant.menu.push(menu);
            }

            await existingRestaurant.save();

            return res.status(StatusCodes.OK.code).json({
                code: StatusCodes.OK.code,
                message: "Restaurant updated",
                data: existingRestaurant
            });
        }

        const newRestaurant = new Restaurant({
            name: name,
            location: location,
            menu: Array.isArray(menu) ? menu : [menu]
        });

        await newRestaurant.save();

        return res.status(StatusCodes.CREATED.code).json({
            code: StatusCodes.CREATED.code,
            message: "Restaurant created",
            data: newRestaurant
        });

    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}

export default createRestorant;