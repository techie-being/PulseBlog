import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { paginateQuery } from "../utils/pagination.js";
import { paginateAggregate } from "../utils/pagination.js";
import { generateEmbedding } from "../utils/Embedding.js";
import { cloudinaryUploader } from "../utils/Cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import { Post } from "../models/post.models.js";
import { User } from "../models/user.models.js";

const createPost = Asynchandler(async (req, res) => {
  const { title, content, tags, isPublished } = req.body;

  if (!title || !content) {
    throw new Apierror(401, "title and content are mandat6ory");
  }

  const localPath = req.files?.mediaImage?.[0]?.path;
  console.log("imagelink from os :", localPath);

  if (!localPath) {
    throw new Apierror(401, "thumbnail local path not found");
  }

  const thumbnail = await cloudinaryUploader(localPath);

  //this takes title and content and conver tit into numerical values(embedding)
  //when user search a query it converts those query to numeric value and match
  //it with stored embedding it understands meanning rather than keyword
  const embedding = await generateEmbedding(`${title}. ${content}`);

  if (!embedding) {
    throw new Apierror(
      500,
      "embedding not generated due to some internal error",
    );
  }

  const createdPost = await Post.create({
    title,

    content,
    mediaImage: thumbnail.url,
    owner: req.user._id,
    tags: tags || [],
    isPublished: isPublished || false,
    contentVector: embedding,
  });

  return res
    .status(201)
    .json(new Apiresponse(201, createdPost, "Post created successfully"));
});

//home feed
const getAllPost = Asynchandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const isColdStart =
    !req.user ||
    !req.user.userIntrestVector ||
    req.user.userIntrestVector.length === 0;

  if (isColdStart) {
    //this is temporarily set as false due tobakend consistency
    const filter = { isPublished: false };
    const result = await paginateQuery(Post, filter, page, limit, {
      populate: { path: "owner", select: "username avatar" },
      sort: { createdAt: -1 },
    });

    return res.status(200).json(
      new Apiresponse({
        status: 200,
        result,
        message: "posts fetched succesfully",
      }),
    );
  }

  const smartFeed = [
    {
      $vectorSearch: {
        index: "vector_index",
        path: "contentVector",
        queryVector: req.user.userIntrestVector,
        numCandidates: 100,
        limit: 100,
      },
    },

    {
      $match: {
        isPublished: false,
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",

        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
               
            },
          },
        ],
      },
    },

    {
      $unwind: "$owner",
    },
  ];

  const result = await paginateAggregate(Post, smartFeed, page, limit);
  //if user is logged in but dont have any inrest or interaction then only latest posts re recommended
  const filter = { isPublished: false };
  if (result.data.length === 0) {
    const result = await paginateQuery(Post, filter, page, limit, {
      populate: { path: "owner", select: "username avatar" },
      sort: { createdAt: -1 },
    });
    return res.status(200).json(
      new Apiresponse({
        status: 200,
        result,
        message: "posts fetched successfully",
      }),
    );
  }
  return res.status(200).json({
    status: 200,
    result,
    message: "user preference related post fetched successfully",
  });
});

//it converts title in to slug then find post and return it
// using search

//pending for testing
const getPostById = Asynchandler(async (req, res) => {
  const { postId } = req.params; // Better to use :postId in route

  // 1. Fetch the actual post by ID (Direct & Fast)
  const post = await Post.findById(postId).populate("owner", "username avatar");
  if (!post) throw new Apierror(404, "Post not found");

  // 2. OPTIONAL: Use this post's vector to find 3 related posts
  const relatedPosts = await Post.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "contentVector",
        queryVector: post.contentVector,
        numCandidates: 50, // Increase this for better discovery
        limit: 10, // Get more than you need to account for filtering
      },
    },
    {
      $project: {
        title: 1,
        score: { $meta: "vectorSearchScore" }, // See how related they are!
      },
    },
    { $match: { _id: { $ne: post._id } } },
    { $limit: 3 }, // Finally limit to the 3 you want to show in UI
  ]);

  return res
    .status(200)
    .json(
      new Apiresponse(
        200,
        { post, relatedPosts },
        "Post and related content fetched",
      ),
    );
});

const deletePost = Asynchandler(async (req, res) => {
  const { postId } = req.params;

  const foundPost = await Post.findById(postId);

  if (!foundPost) {
    throw new Apierror(404, "posts not found");
  }

  const user = req.user._id;

  if (user.toString() !== foundPost.owner.toString()) {
    throw new Apierror(403, "unauthorize to delete post");
  }

  const imageUrl = foundPost.mediaImage;

  if (imageUrl) {
    const publicId = imageUrl.split("/").pop().split(".")[0];

    await cloudinary.uploader.destroy(publicId);
  }

  await Post.findByIdAndDelete(postId);

  return res
    .status(200)
    .json(new Apiresponse(200, {}, "Post deleted successfully"));
});

//slug and post id may create a mesh be careful while testing
const updatePost = Asynchandler(async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  const findPost = await Post.findById(postId);

  if (!findPost) {
    throw new Apierror(404, "Post not found");
  }

  if (findPost.owner.toString() !== req.user._id.toString()) {
    throw new Apierror(403, "unauthorize to perform update request");
  }

  //here we cannot put findpost.content because it overwrites the exiting content instead of just updating

  if (title) {
    findPost.title = title;
  }

  if (content) {
    findPost.content = content;
  }
  
  console.log('does file is coming',req.file)
  
  console.log("File received:", req.file); // If this is undefined, it's a Multer/Postman issue
  
  if (req.file) {
    const existingImage = findPost.mediaImage;
    console.log("Old Image URL:", existingImage);

    const newImage = await cloudinaryUploader(req.file.path);
    console.log("Cloudinary Upload Result:", newImage); // If this is null, check your Cloudinary config

    if (!newImage) {
      throw new Apierror(500, "Something went wrong while uploading new image");
    }

    if (existingImage) {
      const fileName = existingImage.split("/").pop().split(".")[0];
      const publicId = `PulseBlogAssets/${fileName}`;
      console.log("Deleting Public ID:", publicId);
      await cloudinary.uploader.destroy(publicId);
    }

    findPost.mediaImage = newImage.url;
  }

  const update = await findPost.save();

  return res.status(200).json({
    status: 200,
    data: update,
    message: "Post updated successfully",
  });
});

const getPostByAuthor = Asynchandler(async (req, res) => {
  //verfiy jwt to get userId
  const { userId } = req.params;

  const { page, limit } = req.query;

  const loggedInUserId = req.user?._id;

  const isOwner =
    loggedInUserId && loggedInUserId.toString() === userId.toString();

  const dbQuery = { owner: userId };

  if (!isOwner) {
    dbQuery.isPublished = true;
  }

  const result = await paginateQuery(Post, dbQuery, page, limit, {
    populate: { path: "owner", select: "username avatar" },
    sort: { createdAt: -1 },
  });

  if (!result.data || result.data.length === 0) {
    return res
      .status(200)
      .json(
        new Apiresponse(
          200,
          { data: [], pagination: result.pagination },
          "No posts found for this user",
        ),
      );
  }

  return res.status(200).json({
    status: 200,
    data: result,
    message: "All posts fetched successfully",
  });
});

//in route postId should be their either wise it says undefined
const togglePostStatus = Asynchandler(async (req, res) => {
  //verify jwt
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    throw new Apierror(404, "post not found");
  }
  
  if (!post.content || post.content.trim().length < 300) {
    throw new Apierror(400, "Content is too short to publish. Add a few more words!");
  }

  
  if (!post.mediaImage) {
    console.log("Hey, adding an image increases engagement by 40%! Are you sure you want to publish without one?");
  }
  if (post.owner.toString() !== req.user._id.toString()) {
    throw new Apierror(403, "unauthorize to perform this request");
  }

  post.isPublished = !post.isPublished;
  const flippedStatus = await post.save();

  return res.status(200).json(
    new Apiresponse({
      status: 200,
      data: flippedStatus,
      message: "status saved successfully",
    }),
  );
});

const searchPostsDiscovery = Asynchandler(async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;

  if (!query) {
    throw new Apierror(400, "Search query is required");
  }

  const vector = await generateEmbedding(query);

  const pipeline = await Post.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "contentVector",
        queryVector: vector,
        numCandidates: 100,
        limit: 10,
        filter: { isPublished: { $eq: false } },
      },
    },

    {
      $lookup: {
        from: "User",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $addFields: 
        {searchScore: { $meta: "vectorSearchScore" },
        viewsCount: {
          $size: {
            $ifNull: ["$views", []],
          },
        },
      },
    },
    
    {
      $sort: { searchScore: -1 } // CRITICAL FIX: Lock Rome at the top based on AI score
    },

    {
      $project: {
        "owner.password": 0,
        "owner.refreshToken": 0,
        contentVector: 0,
        
      },
    },
  ]);

  const result = await paginateAggregate(Post, pipeline, page, limit);

  return res.status(200).json(
    new Apiresponse(
      200,
      result,
      "top Post recommended successfully",
    ),
  );
});

const viewsCount = Asynchandler(async (req, res) => {
  const { postId } = req.params;

  const updatePost = await Post.findByIdAndUpdate(
    postId,
    {
      $inc: {
        views: 1,
      },
    },
    {
      new: true,
    },
  );

  if (!updatePost) {
    throw new Apierror(404, "post does not find");
  }

  return res.status(200).json(
    new Apiresponse(
        200, 
        updatePost.views, // Use the actual field name from your Schema
        "views updated successfully"
    )
);
});

export {
  createPost,
  getAllPost,
  getPostById,
  deletePost,
  updatePost,
  getPostByAuthor,
  togglePostStatus,
  searchPostsDiscovery,
  viewsCount,
};
