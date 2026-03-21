import { Asynchandler } from "../utils/Asynchandler";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Asynchandler.js";
import { Like } from "../models/likes.models.js";
import { User } from "../models/user.models.js";
import { Post } from "../models/post.models.js";

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

  const like = await Like.create({
    postId,
    likedBy: userId,
  });

  const updatedLike = await Post.findByIdAndUpdate(
    postId,
    {
      $inc: { likeCount: 1 },
    },
    { new: true },
  );

  return res.status(200).json(
    new Apiresponse({
      status: 200,
      data: updatedLike.likeCount,
      message: "user liked successfully",
    }),
  );
});

const getLikedList = Asynchandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Like.find({ postId }).populate(
    "likedBy",
    "username avatar",
  );

  return res.status(200).json(
    new Apiresponse({
      status: 200,
      data: { post },
      message: "post liked users fetched successfully",
    }),
  );
});

const unlikePost = Asynchandler(async (req, res) => {
  const { postId } = req.params;

  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    throw new Apierror(200, "post does not exist");
  }

  const likedPostExist = await Like.findOne({ postId, userId });

  if (!likedPostExist) {
    throw new Apierror(400, "post is not liked yet");
  }

  const unlike = await Like.findByIdAndDelete({ postId });

  const updatedPost = await Post.findByIdAndUpdate(
    {
      $inc: {
        likeCount: -1,
      },
    },
    { new: true },
  );

  return res.status(200).json(
    new Apiresponse({
      status: 200,
      data: updatedPost.likeCount,
      message: "user successfully unliked the post",
    }),
  );
});

const likedStatus = Asynchandler(async (req, res) => {
  const { postId } = req.params;

  const userId = req.user._id;
  const post = await Post.findById(postId);

  if (!post) {
    throw new Apierror(200, "post does not exist");
  }

  const likeExist = await Like.findOne({ postId, userId });

  if (!likeExist) {
    const isLiked = false;
    return res.status(200).json(
      new Apiresponse({
        status: 200,
        data: isLiked,
        measage: "user has not liked this post",
      }),
    );
  }

  const isLiked = true;
  return res.status(200).json(
    new Apiresponse({
      status: 200,
      data: isLiked,
      measage: "user has not liked this post",
    }),
  );
});

export { likedPost, getLikedList, unlikePost ,likedStatus };
