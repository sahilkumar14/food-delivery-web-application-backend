import { StatusCodes } from "http-status-pro-js";
import User from "../models/usermodels.models.js";
import bcrypt from "bcrypt";



function createUser(req,res){
    let{name,email,password} =req.body;

    try{
        let pass = bcrypt.hashSync(password,10);
        password = pass;
        let obj = new User ({name,email,password});
        obj.save()
        .then(()=>{
            console.log("saved");
            res.status(StatusCodes.CREATED.code).json({
                code:StatusCodes.CREATED.code,
                message:StatusCodes.CREATED.message,
                data:null
            })
        })
        .catch((err)=>{
            console.log(err);
        })

    }catch(err){
        console.log("create ",err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code:StatusCodes.INTERNAL_SERVER_ERROR.code,
            message:StatusCodes.INTERNAL_SERVER_ERROR.message,
            data:null
        })
    }
}
export default createUser;

// login 

export function userLogin(req,res){
    try{
        const{email,password} = req.body;
       
        User.findOne({email:email},{_id:0,name:1})
        .then((data)=>{
            console.log(data);
            if(!data){
               return res.status(StatusCodes.BAD_REQUEST.code).json({
                code:StatusCodes.BAD_REQUEST.code,
                message:StatusCodes.BAD_REQUEST.message,
                data:data
            })
            }
            const comPass = bcrypt.compareSync(password,data.password);
            if(!comPass){
                return res.status(StatusCodes.BAD_REQUEST.code).json({
                code:StatusCodes.BAD_REQUEST.code,
                message:StatusCodes.BAD_REQUEST.message,
                data:null
            })
            }
           return res.status(StatusCodes.OK.code).json({
                code:StatusCodes.OK.code,
                message:StatusCodes.OK.message,
                data:data
            })
        })
        .catch((err)=>{
            console.log(err);
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
