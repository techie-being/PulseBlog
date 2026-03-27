import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Asynchandler.js";
import { Apiresponse } from "../utils/Asynchandler.js";
import {paginateQuery} from "../utils/pagination.js";
import {paginateAggregate} from "../utils/pagination.js"
import {generateEmbedding} from "../utils/pagination.js"

import { cloudinaryUploader } from "../utils/Cloudinary.js";
import { Post } from "../models/post.models.js";
import { User } from "../models/user.models.js";

const createPost = Asynchandler(async (req, res) => {
  const { title, content, tags, isPublished } = req.body;

  if (!title || !content) {
    throw new Apierror(401, "title and content are mandat6ory");
  }

  const localPath = req.files?.mediaImage?.[0]?.path;

  if (!localPath) {
    throw new Apierror(401, "thumbnail local path not found");
  }

  const thumbnail = await cloudinaryUploader(localPath);

  //this takes title and content and conver tit into numerical values(embedding)
  //when user search a query it converts those query to numeric value and match
  //it with stored embedding it understands meanning rather than keyword
  const embedding = await generateEmbedding(`${title}. ${content}`);

  if(!embedding){
    throw new Apierror(500,"embedding not generated due to some internal error")
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

  const isColdStart = !req.user || !req.user.userIntrestVector || req.user.userIntrestVector.length === 0;

  if (isColdStart) {
    const filter = { isPublished: true };
    const result = await paginateQuery(Post, filter, page, limit, {
      populate: { path: "owner", select: "username avatar" },
      sort: { createdAt: -1 }
    });

    return res
      .status(200)
      .json(new Apiresponse({
        status:200,
        data:result,
        message:"posts fetched succesfully"

      }));
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
        isPublished: true,
      },
    },

    {
      $lookup: {
        from: User,
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

  return res
    .status(200)
    .json({
      status:200,
      data:result,
      message:"user preference related post fetched successfully"
    });
});

//it converts title in to slug then find post and return it
// using search
const getPostById = Asynchandler(async (req, res) => {
  const { slug } = req.params;

  const post = await Post
    .findOne({ slug, isPublished: true })
    .populate("owner", "username avatar", "views");

  if (!post) {
    throw new Apierror(404, "post does not found");
  }

  return res.status(200).json(200, post, "PostById fetched successfully");
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

    await cloudinaryUploader.destroy(publicId);
  }

  await Post.findByIdAndDelete(postId);

  return res
    .status(200)
    .json(new Apiresponse(200, {}, "Post deleted successfully"));
});

//slug and post id may create a mesh be careful while testing
const updatePost = Asynchandler(async (req, res) => {
  const { postId } = req.params;

  const findPost = await Post.findById(postId);

  if (!findPost) {
    throw new Apierror(404, "Post not found");
  }

  if (findPost.owner.toString() !== req.user._id.toString()) {
    throw new Apierror(403, "unauthorize to perform update request");
  }

  //here we cannot put findpost.content because it overwrites the exiting content instead of just updating

  if (req.body.text) {
    findPost.text = req.body.text;
  }

  if (req.file) {
    const existingImage = findPost.mediaImage;

    const newImage = await cloudinaryUploader(req.file?.path);

    if (!newImage) {
      throw new Apierror(500, "somethong went wrong while uploading new image");
    }

    if (existingImage) {
      const imageId = existingImage.split("/").pop().split(".")[0];

      await cloudinaryUploader.destroy(imageId);
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

  const {page,limit}  = req.query;

  const loggedInUserId = req.user?._id; 

  const isOwner = loggedInUserId && loggedInUserId.toString() === userId.toString();

  const dbQuery = { owner: userId };

  if (!isOwner) {
    dbQuery.isPublished = true;
  }

  const result = await paginateQuery(Post, dbQuery, page, limit, {
    populate: { path: "owner", select: "username avatar" },
    sort: { createdAt: -1 }
  });

  
  if (!result.data || result.data.length === 0) {
    return res.status(200).json(
      new Apiresponse(200, { data: [], pagination: result.pagination }, "No posts found for this user")
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

  const Post = await Post.findById(postId);

  if (!Post) {
    throw new Apierror(404, "post not found");
  }

  if (Post.owner.toString() !== req.user._id.toString()) {
    throw new Apierror(403, "unauthorize to perform this request");
  }

  Post.isPublished = !Post.isPublished;
  const flippedStatus = await Post.save();

  return res.status(200).json(
    new Apiresponse({
      status: 200,
      data: flippedStatus,
      message: "status saved successfully",
    }),
  );
});

const searchPostsDiscovery = Asynchandler(async (req,res) => {
  const {query,page=1,limit=1} = req.query;

  if (!query) {
    throw new Apierror(400, "Search query is required");
  }

  const vector = await generateEmbedding(query);

  const pipeline = await Post.aggregate(
    [
      {
        $vectorSearch:{
          index:"vector_index",
          path:"contentVector",
          queryVector:vector,
          numCandidates:100,
          limit:10,
          filter:{isPublished:{$eq:true}}
        }
      },
      
      {
        $lookup:{
          from:"User",
          localField:"owner",
          foreignField:"_id",
          as:"owner"
        }
      },
      {
        $unwind:"$owner"
      },
      {
        $addFields:{
          viewsCount:{ 
            $size: { 
              $ifNull: ["$views", []] 
            } 
          },
        }
      },
      {
        $project:{
          "owner.password":0,
          "owner.refreshToken":0,
          contentVector:0,
        }
       
      }
    ]
  )

  const result = await paginateAggregate(Post, pipeline, page, limit);

  return res
  .status(200)
  .json(
    new Apiresponse(
        {
          status:200,
          data:result,
          message:"top Post recommended successfully"
        }
    )
    
  )


})

const viewsCount = Asynchandler(async (req,res) => {
  const {postId} = req.params;

  const updatePost = await Post.findByIdAndUpdate(
    postId,
    {
      $inc:{
        views:1
      }
    },
    {
      new:true,
      runValidators:false
    }
  )

  if(!updatePost){
    throw new Apierror(404,"post does not find");
  }

  return res
  .status(200)
  json(
    {
      status:200,
      data:updatePost.viewsCount,
      message:"views updated successFully"
    }
  )
})

export {
  createPost,
  getAllPost,
  getPostById,
  deletePost,
  updatePost,
  getPostByAuthor,
  togglePostStatus,
  searchPostsDiscovery,
  viewsCount
};
