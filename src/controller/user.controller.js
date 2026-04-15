import { StatusCodes } from "http-status-pro-js";
import User from "../models/usermodels.models.js";
import bcrypt from "bcrypt";

export async function createUser(req,res){
    let{name,email,password,mob,dob,address,addressCoordinates} =req.body;

    try{
         const existingUser = await User.findOne({ email })
         if (existingUser) {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "A user already exists with this email.",
                data: null
            })
         }
        let pass = bcrypt.hashSync(password,10);
        password = pass;
        let obj = new User ({name,email,password,mob,dob,address,addressCoordinates: addressCoordinates || null});
        await obj.save()
           return res.status(StatusCodes.CREATED.code).json({
                code:StatusCodes.CREATED.code,
                message:StatusCodes.CREATED.message,
                data: {
                  _id: obj._id,
                  name: obj.name,
                  email: obj.email,
                  mob: obj.mob,
                  dob: obj.dob || null,
                  address: obj.address,
                  addressCoordinates: obj.addressCoordinates || null,
                }
            })
    }catch(err){
        console.log("create ",err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code:StatusCodes.INTERNAL_SERVER_ERROR.code,
            message:StatusCodes.INTERNAL_SERVER_ERROR.message,
            data:null
        })
    }
}


// login 

export async function userLogin(req, res) {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email })

            if (!user) {
                return res.status(StatusCodes.BAD_REQUEST.code).json({
                    code: StatusCodes.BAD_REQUEST.code,
                    message: "User not found",
                    data: null
                });
            }

            const comPass = bcrypt.compareSync(password, user.password);

            if (!comPass) {
                return res.status(StatusCodes.UNAUTHORIZED.code).json({
                    code: StatusCodes.UNAUTHORIZED.code,
                    message: "Invalid password",
                    data: null
                });
            }

            return res.status(StatusCodes.OK.code).json({
                code: StatusCodes.OK.code,
                message: StatusCodes.OK.message,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    mob: user.mob,
                    dob: user.dob || null,
                    address: user.address,
                    addressCoordinates: user.addressCoordinates || null
                }
            });
    } catch (err) {
        console.log("login error", err);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: StatusCodes.INTERNAL_SERVER_ERROR.message,
            data: null
        });
    }
}

export async function updateUser(req, res) {
    try {
        const { userId } = req.params;
        const { name, mob, dob, address, addressCoordinates } = req.body;

        if (!userId) {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "User ID is required",
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

        if (name !== undefined) user.name = name;
        if (mob !== undefined) user.mob = mob;
        if (dob !== undefined) user.dob = dob;
        if (address !== undefined) user.address = address;
        if (addressCoordinates !== undefined) user.addressCoordinates = addressCoordinates;

        await user.save();

        return res.status(StatusCodes.OK.code).json({
            code: StatusCodes.OK.code,
            message: "User updated successfully",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mob: user.mob,
                dob: user.dob || null,
                address: user.address,
                addressCoordinates: user.addressCoordinates || null
            }
        });
    } catch (err) {
        console.log("update user error", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: StatusCodes.INTERNAL_SERVER_ERROR.message,
            data: null
        });
    }
}
