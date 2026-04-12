import mongoose,{Schema} from "mongoose";
import { Post } from "./post.models.js";

const shareSchema = new Schema(
    {
        shareUserId:{
            type:Schema.Types.ObjectId,
            ref:"User",
        },
        postId:{
            type:Schema.Types.ObjectId,
            ref:"post"
        }

    },
    {timestamps:true}
)

shareSchema.post("save", async function (doc) {
    await Post.findByIdAndUpdate(doc.postId, { $inc: { shareCount: 1 } });
});

export const Share = mongoose.model("Share",shareSchema)