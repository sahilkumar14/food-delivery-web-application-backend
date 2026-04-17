import DeliveryAgent from "../models/agent.models.js";
import { StatusCodes } from "http-status-pro-js";
import bcrypt from "bcrypt";

export async function createAgent(req, res) {
    const { name,email,password, phone ,vehicleNo} = req.body;

    try {
        let existingAgent = await DeliveryAgent.findOne({ phone });

        if (existingAgent) {
            return res.status(StatusCodes.BAD_REQUEST.code).json({
                code: StatusCodes.BAD_REQUEST.code,
                message: "Agent with this phone number already exists",
                data: null
            });
        }

        let pass = bcrypt.hashSync(password,10);

        const newAgent = new DeliveryAgent({
            name,
            email,
            password:pass,
            phone,
            vehicleNo
        });
 
        await newAgent.save();

        return res.status(StatusCodes.CREATED.code).json({
            code: StatusCodes.CREATED.code,
            message: "Delivery Agent registered successfully",
            data: newAgent
        });

    } catch (err) {
        console.log("agent ",err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}

// login of delivery agent

export async function agentLogin (req,res){
    const{email,password} = req.body;
    try{
       const agent =  await DeliveryAgent.findOne({email})
       if(!agent){
        return res.status(StatusCodes.NOT_FOUND.code).json({
                code: StatusCodes.NOT_FOUND.code,
                message: "Agent not exixst",
                data: null
            });
       }
       let comPass = bcrypt.compareSync(password,agent.password);
       if(!comPass){
        return res.status(StatusCodes.UNAUTHORIZED.code).json({
                code: StatusCodes.UNAUTHORIZED.code,
                message: "Agent password is wrong",
                data: null
            });
       }
       return res.status(StatusCodes.OK.code).json({
                code: StatusCodes.OK.code,
                message: "agent login successfully",
                data: agent
            });

    }catch (err) {
        console.log("agent login ",err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
            code: StatusCodes.INTERNAL_SERVER_ERROR.code,
            message: err.message,
            data: null
        });
    }
}





