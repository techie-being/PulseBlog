import { Asynchandler } from "../utils/Asynchandler.js";
import {Apierror} from "../utils/Apierror.js"
import { Apiresponse } from "../utils/Apiresponse.js";
import { Post } from "../models/post.models.js";

const sharePost = Asynchandler(async (req, res) => {
    const { postId } = req.params;
    
    // Create the record. The middleware in the model handles the count!
    const newShare = await Share.create({
        postId,
        shareUserId: req.user._id
    });

    return res.status(201).json(
        new Apiresponse({
            status: 201,
            data: newShare,
            message: "Post shared and count updated"
        })
    );
});

export {sharePost}