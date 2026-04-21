import mongoose,{Schema} from "mongoose";
import { User } from "./user.models.js";

const likeSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    likedBy: { // Make sure this is 'likedBy' to match your data
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

// This ensures Mongoose handles the unique constraint correctly
likeSchema.index({ postId: 1, likedBy: 1 }, { unique: true });

export const Like = mongoose.model("Like", likeSchema);