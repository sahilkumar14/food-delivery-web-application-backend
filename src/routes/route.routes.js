import express from "express";
import {createUser, userLogin } from "../controller/user.controller.js";
import {createRestorant, addMenu, restaurantLogin, getRestaurantOrders } from "../controller/restaurant.controller.js";
import { getNearbyRestaurants } from "../controller/nearRestaurant.controller.js";
import {agentLogin, createAgent }from "../controller/agent.controller.js";
import { createOrder } from "../controller/order.controller.js";

const router = express.Router();

router.post("/reg",createUser);
router.post("/login",userLogin);
//agent
router.post("/agentCreate",createAgent)
router.post("/agentLogin",agentLogin);

//restaurant 
router.post("/restaurantSignup",createRestorant);
router.post("/restaurantLogin",restaurantLogin);
router.get("/restaurants/nearby/:location",getNearbyRestaurants);
router.get("/restaurant/orders/:restaurantId", getRestaurantOrders);

//order
router.post("/order",createOrder)

//addmenu
router.post("/addMenu",addMenu)


export default router;
