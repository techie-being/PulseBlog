import { Asynchandler } from "../utils/Asynchandler.js";
import {Apierror} from "../utils/Apierror.js"
import { Apiresponse } from "../utils/Apiresponse.js";
import { Post } from "../models/post.models.js";

const shareCount = Asynchandler(async (req,res) => {
    const {postId} = req.params;

    const updatePost = await Post.findByIdAndUpdate(
        postId,
        {
            $inc:{
                shareCount:1,
            }
        },
        {
            new:true,
            runValidators: false,
        }
    );

    if(!updatePost){
        throw new Apierror(404,"post does not exist");
    }

    return res
    .status(200)
    .json(
        {
            status:200,
            data:updatePost.shareCount,
            message:"sharecount updated successfully"
        }
    )
})

export {shareCount}