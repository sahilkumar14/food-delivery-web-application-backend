import { StatusCodes } from "http-status-pro-js";
import Restaurant from "../models/restaurant.models.js";
import Order from "../models/myorders.models.js";
import bcrypt from  "bcrypt";

const sanitizeRestaurant = (restaurant) => ({
    _id: restaurant._id,
    name: restaurant.name,
    email: restaurant.email,
    location: restaurant.location,
    menu: restaurant.menu,
    createdAt: restaurant.createdAt,
    updatedAt: restaurant.updatedAt
});

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
            data: sanitizeRestaurant(newRestaurant)
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
                data: sanitizeRestaurant(restaurant)
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
        const{email, restaurantId, menu, category, itemName, name, price, description} = req.body;
        const restaurant = restaurantId
            ? await Restaurant.findById(restaurantId)
            : await Restaurant.findOne({email})
        if(!restaurant){
             return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Restaurant not exists with this email",
                data: null
            });
        }
        if(!menu){
            if (!price || !(itemName || name) || !category) {
                return res.status(StatusCodes.BAD_REQUEST.code).json({
                    code: StatusCodes.BAD_REQUEST.code,
                    message: "Category, item name and price are required",
                    data: null
                });
            }

            const normalizedItem = {
                itemName: itemName || name,
                price,
                description: description || ""
            };

            const existingCategory = restaurant.menu.find(
                (section) => section.category.toLowerCase() === category.toLowerCase()
            );

            if (existingCategory) {
                existingCategory.items.push(normalizedItem);
            } else {
                restaurant.menu.push({
                    category,
                    items: [normalizedItem]
                });
            }

            const updatedRestaurant = await restaurant.save();

            return res.status(StatusCodes.OK.code).json({
                code: StatusCodes.OK.code,
                message: "Menu item added successfully",
                data: sanitizeRestaurant(updatedRestaurant)
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
                data: sanitizeRestaurant(updateMenu)
            });


    }catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}

// get restaurant orders
export async function getRestaurantOrders(req, res) {
    try {
        const { restaurantId } = req.params;
        
        if (!restaurantId) {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Restaurant ID is required",
                data: null
            });
        }

        const orders = await Order.find({ restaurantId })
            .populate('userId', 'name email mob')
            .sort({ createdAt: -1 });

        return res.status(StatusCodes.OK.code).json({
            code: StatusCodes.OK.code,
            message: "Orders fetched successfully",
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

export async function getRestaurantMenu(req, res) {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(StatusCodes.NOT_FOUND.code).json({
                code: StatusCodes.NOT_FOUND.code,
                message: "Restaurant not found",
                data: null
            });
        }

        return res.status(StatusCodes.OK.code).json({
            code: StatusCodes.OK.code,
            message: "Restaurant menu fetched successfully",
            data: restaurant.menu || []
        });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}

export async function deleteMenuItem(req, res) {
    try {
        const { id } = req.params;
        const restaurant = await Restaurant.findOne({ "menu.items._id": id });

        if (!restaurant) {
            return res.status(StatusCodes.NOT_FOUND.code).json({
                code: StatusCodes.NOT_FOUND.code,
                message: "Menu item not found",
                data: null
            });
        }

        restaurant.menu = restaurant.menu
            .map((section) => ({
                ...section.toObject(),
                items: section.items.filter((item) => String(item._id) !== String(id))
            }))
            .filter((section) => section.items.length > 0);

        await restaurant.save();

        return res.status(StatusCodes.OK.code).json({
            code: StatusCodes.OK.code,
            message: "Menu item deleted successfully",
            data: sanitizeRestaurant(restaurant)
        });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}

export async function updateMenuItem(req, res) {
    try {
        const { id } = req.params;
        const { name, itemName, description, price } = req.body;

        const restaurant = await Restaurant.findOne({ "menu.items._id": id });

        if (!restaurant) {
            return res.status(StatusCodes.NOT_FOUND.code).json({
                code: StatusCodes.NOT_FOUND.code,
                message: "Menu item not found",
                data: null
            });
        }

        let updatedItem = null;

        restaurant.menu.forEach((section) => {
            section.items.forEach((item) => {
                if (String(item._id) === String(id)) {
                    if (name || itemName) item.itemName = name || itemName;
                    if (description !== undefined) item.description = description;
                    if (price !== undefined) item.price = price;
                    updatedItem = item;
                }
            });
        });

        await restaurant.save();

        return res.status(StatusCodes.OK.code).json({
            code: StatusCodes.OK.code,
            message: "Menu item updated successfully",
            data: updatedItem
        });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}

export async function getAllRestaurants(req, res) {
    try {
        const restaurants = await Restaurant.find().sort({ createdAt: -1 });

        return res.status(StatusCodes.OK.code).json({
            code: StatusCodes.OK.code,
            message: "Restaurants fetched successfully",
            data: restaurants.map(sanitizeRestaurant)
        });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}

export async function getRestaurantById(req, res) {
    try {
        const { restaurantId } = req.params;

        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(StatusCodes.NOT_FOUND.code).json({
                code: StatusCodes.NOT_FOUND.code,
                message: "Restaurant not found",
                data: null
            });
        }

        return res.status(StatusCodes.OK.code).json({
            code: StatusCodes.OK.code,
            message: "Restaurant fetched successfully",
            data: sanitizeRestaurant(restaurant)
        });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}
