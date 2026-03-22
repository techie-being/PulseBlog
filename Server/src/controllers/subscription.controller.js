import { Asynchandler } from "../utils/Asynchandler";
import { Apierror } from "../utils/Apierror";
import { Apiresponse } from "../utils/Apiresponse";

import {subscription} from "../models/subscription.models.js";

const toggleSubscription = Asynchandler(async (req,res) => {
    //person who is followed
    const {channelID} = req.params;

    const userId = req.user?._id;

    if(!channelID){
        throw new Apierror(404,"channel does nit exist");
    }

    if(subscriberId.toString() == channelID.toString()){
        throw new Apierror(401,"you cannot follow yourself")
    }

    const credentials = {subscriber:userId,channel:channelID};

    const subscriberExist = await subscription.findOne(
        credentials
    )

    if(!subscriberExist){
        await subscription.create(credentials)
        return res
        .status(200)
        .json(
            new Apiresponse(
                {
                    status:201,
                    followed:true,
                    message:"user followed successfully"
                }
            )
        )   
    }

    await subscription.findOneAndDelete(
        credentials
    );

    return res
    .status(200)
    .json(
        new Apiresponse(
            {
                status:200,
                followed:false,
                messsage:"user infollowed successfully"
            }
        )
    )




})
export{
    toggleSubscription,

}