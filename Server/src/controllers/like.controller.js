import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { Like } from "../models/likes.models.js";
import { User } from "../models/user.models.js";
import { Post } from "../models/post.models.js";
import { paginateQuery } from "../utils/pagination.js";

const likedPost = Asynchandler(async (req, res) => {
  const { postId } = req.params;

  // 1. Ensure user is present (prevents 'undefined' error)
  if (!req.user?._id) {
    throw new Apierror(401, "You must be logged in to like posts");
  }
  
  const userId = req.user._id;

  // 2. Check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    throw new Apierror(404, "Post not found");
  }

  // 3. Check for existing like using the correct field: 'likedBy'
  const existingLike = await Like.findOne({ postId, likedBy: userId });
  if (existingLike) {
    throw new Apierror(400, "Post has been liked by you already");
  }

  // 4. Create the like using 'likedBy' (Matches your Schema)
  await Like.create({
    postId,
    likedBy: userId, 
  });

  // 5. Update the count
  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { $inc: { likeCount: 1 } },
    { new: true }
  );

  if (!updatedPost) throw new Apierror(500, "Failed to update like count");

  return res.status(200).json(
    new Apiresponse(200, updatedPost.likeCount, "User liked successfully")
  );
});

const getLikedList = Asynchandler(async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const result = await paginateQuery(Like, { postId }, page, limit, {
    populate: { path: "likedBy", select: "username avatar" },
  });

  return res
    .status(200)
    .json(
      new Apiresponse(200, result, "Post liked users fetched successfully"),
    );
});

const unlikePost = Asynchandler(async (req, res) => {
  const { postId } = req.params;

  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    throw new Apierror(200, "post does not exist");
  }

  const likedPostExist = await Like.findOne({ postId, likedBy: userId });

  if (!likedPostExist) {
    throw new Apierror(400, "post is not liked yet");
  }

  await Like.findOneAndDelete({ postId, likedBy: userId });

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      $inc: {
        likeCount: -1,
      },
    },
    { new: true },
  );

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

  const likeExist = await Like.findOne({ postId, likedBy: userId });

  if (!likeExist) {
    return res
      .status(200)
      .json(new Apiresponse(200, false, "User has not liked this post"));
  }

  return res
    .status(200)
    .json(new Apiresponse(200, true, "User has liked this post"));
});

export { likedPost, getLikedList, unlikePost, likedStatus };
