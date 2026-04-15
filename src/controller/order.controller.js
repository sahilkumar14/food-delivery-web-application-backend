import Order from "../models/myorders.models.js";
import User from "../models/usermodels.models.js";
import Restaurant from "../models/restaurant.models.js";
import { StatusCodes } from "http-status-pro-js";

export async function createOrder(req, res) {
    const { userId, restaurantId, restaurantName, items, totalPrice, address, deliveryCoordinates } = req.body;

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
            status: "Pending",
            pickupLocation: {
                address: restaurant.location,
                coordinates: restaurant.locationCoordinates || null
            },
            deliveryLocation: {
                address,
                coordinates: deliveryCoordinates || user.addressCoordinates || null
            }
        });

        user.address = address;
        if (deliveryCoordinates) {
            user.addressCoordinates = deliveryCoordinates;
        }

        await user.save();
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
            status: "Ready for Pickup",
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
            status: { $in: ["Assigned to Agent", "Picked from Restaurant", "Out for Delivery"] }
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
            if (order.status !== "Ready for Pickup" || order.deliveryAgentId) {
                return res.status(StatusCodes.BAD_REQUEST.code).json({
                    code: StatusCodes.BAD_REQUEST.code,
                    message: "This order is no longer available to accept",
                    data: null
                });
            }

            order.deliveryAgentId = agentId;
            order.status = "Assigned to Agent";
        } else if (action === "reject") {
            if (order.status !== "Ready for Pickup") {
                return res.status(StatusCodes.BAD_REQUEST.code).json({
                    code: StatusCodes.BAD_REQUEST.code,
                    message: "Only ready for pickup orders can be rejected",
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

export async function updateAgentOrderStatus(req, res) {
    const { orderId } = req.params;
    const { agentId, status } = req.body;

    try {
        if (!orderId || !agentId || !status) {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Order id, agent id and status are required",
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

        if (!order.deliveryAgentId || String(order.deliveryAgentId) !== String(agentId)) {
            return res.status(StatusCodes.FORBIDDEN.code).json({
                code: StatusCodes.FORBIDDEN.code,
                message: "This order is not assigned to the delivery agent",
                data: null
            });
        }

        if (status === "picked") {
            if (!["Assigned to Agent", "Out for Delivery"].includes(order.status)) {
                return res.status(StatusCodes.BAD_REQUEST.code).json({
                    code: StatusCodes.BAD_REQUEST.code,
                    message: "Only assigned orders can be marked picked",
                    data: null
                });
            }

            order.status = "Picked from Restaurant";
        } else if (status === "delivered") {
            if (!["Assigned to Agent", "Picked from Restaurant", "Out for Delivery"].includes(order.status)) {
                return res.status(StatusCodes.BAD_REQUEST.code).json({
                    code: StatusCodes.BAD_REQUEST.code,
                    message: "Only active delivery orders can be marked delivered",
                    data: null
                });
            }

            order.status = "Delivered";
        } else {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Invalid status update",
                data: null
            });
        }

        await order.save();
        await order.populate("restaurantId", "name location");

        return res.status(StatusCodes.OK.code).json({
            code: StatusCodes.OK.code,
            message: "Order status updated successfully",
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

export async function updateRestaurantOrderStatus(req, res) {
    const { orderId } = req.params;
    const { restaurantId, action } = req.body;

    try {
        if (!orderId || !restaurantId || !action) {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Order id, restaurant id and action are required",
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

        if (String(order.restaurantId) !== String(restaurantId)) {
            return res.status(StatusCodes.FORBIDDEN.code).json({
                code: StatusCodes.FORBIDDEN.code,
                message: "This order does not belong to the restaurant",
                data: null
            });
        }

        if (action === "accept") {
            if (order.status !== "Pending") {
                return res.status(StatusCodes.BAD_REQUEST.code).json({
                    code: StatusCodes.BAD_REQUEST.code,
                    message: "Only pending orders can be accepted",
                    data: null
                });
            }

            order.status = "Confirmed";
        } else if (action === "ready") {
            if (order.status !== "Confirmed") {
                return res.status(StatusCodes.BAD_REQUEST.code).json({
                    code: StatusCodes.BAD_REQUEST.code,
                    message: "Only confirmed orders can be marked ready",
                    data: null
                });
            }

            order.status = "Ready for Pickup";
        } else {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Invalid action",
                data: null
            });
        }

        await order.save();
        await order.populate("userId", "name email mob");
        await order.populate("restaurantId", "name location");

        return res.status(StatusCodes.OK.code).json({
            code: StatusCodes.OK.code,
            message: `Order marked ${order.status}`,
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
