import Order from "../models/myorders.models.js";
import User from "../models/usermodels.models.js";
import Restaurant from "../models/restaurant.models.js";
import { StatusCodes } from "http-status-pro-js";

export async function createOrder(req, res) {
    const { userId, restaurantId, restaurantName, items, totalPrice, address } = req.body;

    try {
        if (!userId || !items || !items.length || !totalPrice || !address) {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Missing required order fields",
                data: null
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND.code).json({
                code: StatusCodes.NOT_FOUND.code,
                message: "User not found",
                data: null
            });
        }

        let restaurant = null;

        if (restaurantId) {
            restaurant = await Restaurant.findById(restaurantId);
        }

        if (!restaurant && restaurantName) {
            restaurant = await Restaurant.findOne({ name: restaurantName });
        }

        if (!restaurant) {
            return res.status(StatusCodes.NOT_FOUND.code).json({
                code: StatusCodes.NOT_FOUND.code,
                message: "Restaurant not found",
                data: null
            });
        }

        const newOrder = new Order({
            userId,
            restaurantId: restaurant._id,
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

export async function getAvailableAgentOrders(req, res) {
    const { agentId } = req.params;

    try {
        if (!agentId) {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Agent id is required",
                data: null
            });
        }

        const orders = await Order.find({
            status: { $in: ["Pending", "Confirmed"] },
            deliveryAgentId: null,
            rejectedByAgents: { $nin: [agentId] }
        })
            .populate("restaurantId", "name location")
            .sort({ createdAt: -1 });

        return res.status(StatusCodes.OK.code).json({
            code: StatusCodes.OK.code,
            message: "Available orders fetched successfully",
            data: orders
        });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}

export async function getAgentActiveOrders(req, res) {
    const { agentId } = req.params;

    try {
        if (!agentId) {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Agent id is required",
                data: null
            });
        }

        const orders = await Order.find({
            deliveryAgentId: agentId,
            status: "Out for Delivery"
        })
            .populate("restaurantId", "name location")
            .sort({ createdAt: -1 });

        return res.status(StatusCodes.OK.code).json({
            code: StatusCodes.OK.code,
            message: "Agent active orders fetched successfully",
            data: orders
        });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}

export async function updateAgentOrderDecision(req, res) {
    const { orderId } = req.params;
    const { agentId, action } = req.body;

    try {
        if (!orderId || !agentId || !action) {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Order id, agent id and action are required",
                data: null
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(StatusCodes.NOT_FOUND.code).json({
                code: StatusCodes.NOT_FOUND.code,
                message: "Order not found",
                data: null
            });
        }

        if (order.deliveryAgentId && String(order.deliveryAgentId) !== String(agentId)) {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Order is already assigned to another delivery agent",
                data: null
            });
        }

        if (action === "accept") {
            if (!["Pending", "Confirmed"].includes(order.status) || order.deliveryAgentId) {
                return res.status(StatusCodes.BAD_REQUEST.code).json({
                    code: StatusCodes.BAD_REQUEST.code,
                    message: "This order is no longer available to accept",
                    data: null
                });
            }

            order.deliveryAgentId = agentId;
            order.status = "Out for Delivery";
        } else if (action === "reject") {
            if (!["Pending", "Confirmed"].includes(order.status)) {
                return res.status(StatusCodes.BAD_REQUEST.code).json({
                    code: StatusCodes.BAD_REQUEST.code,
                    message: "Only pending or confirmed orders can be rejected",
                    data: null
                });
            }

            const rejectedByAgents = order.rejectedByAgents || [];

            const alreadyRejected = rejectedByAgents.some(
                (rejectedAgentId) => String(rejectedAgentId) === String(agentId)
            );

            if (!alreadyRejected) {
                order.rejectedByAgents.push(agentId);
            }
        } else {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Invalid action",
                data: null
            });
        }

        await order.save();
        await order.populate("restaurantId", "name location");

        return res.status(StatusCodes.OK.code).json({
            code: StatusCodes.OK.code,
            message: `Order ${action}ed successfully`,
            data: order
        });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}
