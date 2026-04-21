import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { Post } from "../models/post.models.js";
import { Share } from "../models/share.models.js";

const sharePost = Asynchandler(async (req, res) => {
  const { postId } = req.params;

  // Create the record. The middleware in the model handles the count!
  const newShare = await Share.create({
    postId,
    shareUserId: req.user._id,
  });

  return res.status(201).json(
    new Apiresponse(201, newShare, "Post shared successfully")
  );
});

export {sharePost}