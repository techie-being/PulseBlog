import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";

import {subscription} from "../models/subscription.models.js";

const toggleSubscription = Asynchandler(async (req,res) => {
    //person who is followed
    const {channelID} = req.params;

    const userId = req.user?._id;

    if(!channelID){
        throw new Apierror(404,"channel does not exist");
    }

    if(userId.toString() === channelID.toString()){
        throw new Apierror(400,"You cannot follow yourself")
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
            new Apiresponse(200, { followed: true }, "User followed successfully")
        )   
    }

    await subscription.findOneAndDelete(
        credentials
    );

    return res
    .status(200)
    .json(
        new Apiresponse(200, { followed: false }, "User unfollowed successfully")
    )




})
export{
    toggleSubscription,

}