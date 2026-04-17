import { StatusCodes } from "http-status-pro-js";
import User from "../models/usermodels.models.js";
import bcrypt from "bcrypt";

export async function createUser(req,res){
    let{name,email,password,mob,dob,address} =req.body;

    try{
         const data =  await User.findOne({email})
         if(data){
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code:StatusCodes.BAD_REQUEST.code,
                message:StatusCodes.BAD_REQUEST.message,
                data:null
            })
         }
        let pass = bcrypt.hashSync(password,10);
        password = pass;
        let obj = new User ({name,email,password,mob,dob,address});
        await obj.save()
           return res.status(StatusCodes.CREATED.code).json({
                code:StatusCodes.CREATED.code,
                message:StatusCodes.CREATED.message,
                data:null
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

        const user = await User.findOne({ email: email }, { _id: 0, name: 1, password: 1 })

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
                data: { name: user.name }
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