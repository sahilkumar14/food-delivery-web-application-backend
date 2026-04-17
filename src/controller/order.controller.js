import Order from "../models/myorders.models.js";
import { StatusCodes } from "http-status-pro-js";

export async function createOrder(req, res) {
    const { userId, restaurantId, items, totalPrice, address } = req.body;
 
    try {
        const newOrder = new Order({
            userId,
            restaurantId,
            items,
            totalPrice,
            address,
            status: "Pending"
        });

        await newOrder.save();

        return res.status(StatusCodes.CREATED.code).json({
            code: StatusCodes.CREATED.code,
            message: "Order placed successfully",
            data: newOrder
        });

    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}