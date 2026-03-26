import { User } from "../models/user.models";


const alpha = 0.1;
const userSyncVector = async (userId,postEmbedding) => {
    //we get userId from auth middleware in routes
    
    const user = await User.findById(userId);

    if(!user || postEmbedding){
        return;
    }

    let currentVector = user.userIntrestVector;

    if(currentVector.length === 0 || !currentVector){
        currentVector = postEmbedding;
    }

    else{
        const updatedVector = currentVector.map((val,i) => {
            (1 - alpha) * val + (alpha * postEmbedding[i])
        });
        currentVector = updatedVector;
    }

    await user.save();
}
export {userSyncVector}

