import express from "express";
import {createUser, userLogin } from "../controller/user.controller.js";
import {
    createRestorant,
    addMenu,
    restaurantLogin,
    getRestaurantOrders,
    getAllRestaurants,
    getRestaurantById,
    getRestaurantMenu,
    updateRestaurantLocation,
    deleteMenuItem,
    updateMenuItem
} from "../controller/restaurant.controller.js";
import { getNearbyRestaurants } from "../controller/nearRestaurant.controller.js";
import {agentLogin, createAgent }from "../controller/agent.controller.js";
import {
    createOrder,
    getAvailableAgentOrders,
    getAgentActiveOrders,
    updateAgentOrderDecision,
    updateAgentOrderStatus,
    updateRestaurantOrderStatus
} from "../controller/order.controller.js";

const router = express.Router();

router.post("/reg",createUser);
router.post("/login",userLogin);
//agent
router.post("/agentCreate",createAgent)
router.post("/agentLogin",agentLogin);

//restaurant 
router.post("/restaurantSignup",createRestorant);
router.post("/restaurantLogin",restaurantLogin);
router.get("/restaurants", getAllRestaurants);
router.get("/restaurants/nearby/:location",getNearbyRestaurants);
router.get("/restaurants/:restaurantId", getRestaurantById);
router.patch("/restaurants/:restaurantId/location", updateRestaurantLocation);
router.get("/restaurant/orders/:restaurantId", getRestaurantOrders);
// DELETE
router.delete("/menu/:id", deleteMenuItem);

// UPDATE
router.patch("/menu/:id", updateMenuItem);

// GET MENU
router.get("/restaurant/:id/menu", getRestaurantMenu);

//order
router.post("/order",createOrder)
router.patch("/restaurant/orders/:orderId/status", updateRestaurantOrderStatus)
router.get("/agent/orders/available/:agentId", getAvailableAgentOrders)
router.get("/agent/orders/active/:agentId", getAgentActiveOrders)
router.patch("/agent/orders/:orderId/decision", updateAgentOrderDecision)
router.patch("/agent/orders/:orderId/status", updateAgentOrderStatus)

//addmenu
router.post("/addMenu",addMenu)


export default router;
