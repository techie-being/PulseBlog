import mongoose from "mongoose"
import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { Like } from "../models/likes.models.js";
import { User } from "../models/user.models.js";
import { Post } from "../models/post.models.js";
import { paginateQuery } from "../utils/pagination.js";

const likedPost = Asynchandler(async (req, res) => {
  const { postId } = req.params;

  const userId = req.user._id;
  const post = await Post.findById(postId);

  if (!post) {
    throw new Apierror(404, "posts not found");
  }

  const existingLike = await Like.findOne({ post: postId, likedBy: userId });
  if (existingLike) {
    throw new Apierror(400, "post has been liked by you alrady");
  }

  try {
  await Like.create({
    postId,
    likedBy: userId,
  });
} catch (err) {
  if (err.code === 11000) {
    throw new Apierror(400, "Post already liked");
  }
  throw err; 
}

  const updatedLike = await Post.findByIdAndUpdate(
    postId,
    {
      $inc: { likeCount: 1 },
    },
    { new: true },
  );

  return res
  .status(200)
  .json(
    new Apiresponse({
      status: 200,
      data: updatedLike.likeCount,
      message: "user liked successfully",
    }),
  );
});

const getLikedList = Asynchandler(async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const result = await paginateQuery(Like, { postId }, page, limit, {
    populate: { path: "likedBy", select: "username avatar" },
  });

  return res.status(200).json(
    new Apiresponse({
      status: 200,
      data: result,
      message: "Post liked users fetched successfully",
    }),
  );
});

const unlikePost = Asynchandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    throw new Apierror(404, "Post does not exist");
  }
  
  const likedPostExist = await Like.findOne({
    postId: new mongoose.Types.ObjectId(postId),
    likedBy: new mongoose.Types.ObjectId(userId),
  });

  if (!likedPostExist) {
    throw new Apierror(400, "Post is not liked yet");
  }

  // ✅ correct delete
  await Like.findOneAndDelete({
    postId: new mongoose.Types.ObjectId(postId),
    likedBy: new mongoose.Types.ObjectId(userId),
  });

  // ✅ correct update
  const updatedPost = await Post.findOneAndUpdate(
    {
      _id: postId,
      likeCount: { $gt: 0 } // 
    },
    {
      $inc: { likeCount: -1 }
    },
    { new: true }
  );

  if(updatedPost.length == 0){
    throw new Apierror(400,"unlike cannpr be in negative")
  }

  return res
    .status(200)
    .json(
      new Apiresponse(
        200,
        updatedPost.likeCount,
        "User successfully unliked the post",
      ),
    );
});

const likedStatus = Asynchandler(async (req, res) => {
  const { postId } = req.params;

  const userId = req.user._id;
  const post = await Post.findById(postId);

  if (!post) {
    throw new Apierror(200, "post does not exist");
  }

  const likeExist = await Like.findOne({
    postId: new mongoose.Types.ObjectId(postId),
    likedBy: new mongoose.Types.ObjectId(userId),
  });

  if (!likeExist) {
    const isLiked = false;
    return res.status(200).json(
      new Apiresponse(
        200,
        isLiked,
        "user has not liked this post",
      ),
    );
  }

  const isLiked = true;
  return res.status(200).json(
    new Apiresponse(
      200,
      isLiked,
      "user has not liked this post"
    ),
  );
});

export { likedPost, getLikedList, unlikePost, likedStatus };
