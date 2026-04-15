import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./src/routes/route.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: "https://food-delivery-web-application-front-henna.vercel.app",
    credentials: true
}));

app.use("/",router);

const port = process.env.PORT ||  8080;

app.listen(port,()=>{
    console.log("connect");
})