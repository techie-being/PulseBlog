import mongoose,{Schema} from "mongoose";
import { User } from "./user.models.js";

const likeSchema = new Schema(
    {
        likedBy:{
            type:Schema.Types.ObjectId,
            ref:"User",
            
        },
        postId:{
            type:Schema.Types.ObjectId,
            ref:"post",
        }

    },
    {timestamps:true}
)
.index(
    {
       postId:1,
       likerUserId:1,
    },
    {
        unique:true
    }
)

export const Like = mongoose.model("Like",likeSchema)
