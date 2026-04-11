import express from "express";
import createUser, { userLogin } from "../controller/userReg.js";

const router = express.Router();

router.post("/reg", createUser);
router.post("/login", userLogin);

export default router;