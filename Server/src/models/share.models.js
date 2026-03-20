import mongoose,{Schema} from "mongoose";
import { User } from "./user.models.js";

const shareSchema = new Schema(
    {
        shareUserId:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        postId:{
            type:Schema.Types.ObjectId,
            ref:"post"
        }

    },
    {timestamps:true}
)

export const Share = mongoose.model("Share",shareSchema)