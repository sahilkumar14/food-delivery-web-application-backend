import { StatusCodes } from "http-status-pro-js";
import Restaurant from "../models/restaurant.models.js";
import bcrypt from  "bcrypt";

export async function createRestorant(req, res) {
    const { name,email,password, location} = req.body;

    try {
        let pass = bcrypt.hashSync(password,10);
        let existingRestaurant = await Restaurant.findOne({ email });

        if (existingRestaurant) {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Restaurant already exists with this email",
                data: existingRestaurant
            });
        }
        if(!name || !email || !password || !location){
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: StatusCodes.BAD_REQUEST.message,
                data: null
            });
        }

        const newRestaurant = new Restaurant({
            name,
            email,
            password:pass,
            location: location,
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

// restaurant login

export async function restaurantLogin(req,res){
    const{email,password} = req.body;
    try{

        const restaurant = await Restaurant.findOne({email});
        if(!restaurant){
             return res.status(StatusCodes.NOT_FOUND.code).json({
                code: StatusCodes.NOT_FOUND.code,
                message: "Restaurant not exixst",
                data: null
            });
        }
        const comPass = bcrypt.compareSync(password,restaurant.password);
        if(!comPass){
            return res.status(StatusCodes.UNAUTHORIZED.code).json({
                code: StatusCodes.UNAUTHORIZED.code,
                message: "Restaurant password wrong",
                data: null
            });
        }

        return res.status(StatusCodes.OK.code).json({
                code: StatusCodes.OK.code,
                message: "login successfully",
                data: restaurant
            });

    }catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}


// add menu 

export async function addMenu(req,res){
    try{
        const{email,menu} = req.body;
        const restaurant = await Restaurant.findOne({email})
        if(!restaurant){
             return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Restaurant not exists with this email",
                data: existingRestaurant
            });
        } 
        if(!menu){
             return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: StatusCodes.BAD_REQUEST.message,
                data: existingRestaurant
            });
        }
        if (Array.isArray(menu)) {
            restaurant.menu.push(...menu);
        } else {
            
            restaurant.menu.push(menu);
        }
        const updateMenu = await restaurant.save();

         return res.status(StatusCodes.OK.code).json({
                code: StatusCodes.OK.code,
                message: "Save data in menu successfully",
                data: updateMenu
            });


    }catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}