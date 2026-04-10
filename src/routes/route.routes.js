import express from "express";
import createUser, { userLogin } from "../controller/user.controller.js";
import createRestorant from "../controller/restaurant.controller.js";
import { getNearbyRestaurants } from "../controller/nearRestaurant.controller.js";
import createAgent from "../controller/agent.controller.js";
import { createOrder } from "../controller/order.controller.js";

const router = express.Router();

router.post("/reg",createUser);
router.get("/login",userLogin);
//agent
router.post("/agentCreate",createAgent)

//restaurant
router.post("/restaurant",createRestorant);
router.get("/restaurants/nearby/:location", getNearbyRestaurants);

//order
router.post("/order",createOrder)


export default router;
