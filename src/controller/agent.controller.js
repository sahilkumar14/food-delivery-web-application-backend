import DeliveryAgent from "../models/agent.models.js";
import { StatusCodes } from "http-status-pro-js";

async function createAgent(req, res) {
    const { name, phone, isOnline, currentLocation } = req.body;

    try {
        let existingAgent = await DeliveryAgent.findOne({ phone });

        if (existingAgent) {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Agent with this phone number already exists",
                data: null
            });
        }

        const newAgent = new DeliveryAgent({
            name,
            phone,
            isOnline: isOnline || false,
            currentLocation: currentLocation || { lat: 0, lng: 0 }
        });

        await newAgent.save();

        return res.status(StatusCodes.CREATED.code).json({
            code: StatusCodes.CREATED.code,
            message: "Delivery Agent registered successfully",
            data: newAgent
        });

    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}

export default createAgent;