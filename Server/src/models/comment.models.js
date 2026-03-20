import mongoose,{Schema} from "mongoose";
import { User } from "./user.models.js";

const commentSchema = new Schema(
    {
        commentUserId:{
            type:Schema.Types.ObjectId,
            ref:"User",
        },
        content:{
            type:String,
            required:true,
            
        },
        postId:{
            type:Schema.Types.ObjectId,
            ref:"post"
        }
    },
    {timestamps:true}
)

export const Comment = mongoose.model("Comment",commentSchema)