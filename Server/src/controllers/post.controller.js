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
    throw new Apierror(400, "Title and content are mandatory");
  }

  const localPath = req.files?.mediaImage?.[0]?.path;

  if (!localPath) {
    throw new Apierror(400, "Thumbnail image is required");
  }

  const thumbnail = await cloudinaryUploader(localPath);

  if (!thumbnail || !thumbnail.url) {
    throw new Apierror(
      500,
      "Image upload failed. Please check your internet connection or image format.",
    );
  }

  // Generate embedding for search and recommendation
  const embedding = await generateEmbedding(`${title}. ${content}`);

  if (!embedding) {
    throw new Apierror(
      500,
      "Vector embedding could not be generated. AI search features may be unavailable.",
    );
  }

  // Handle tags: convert comma-separated string to array
  let tagsArray = [];
  if (tags) {
    if (typeof tags === "string") {
      try {
        const parsed = JSON.parse(tags);
        tagsArray = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        tagsArray = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "");
      }
    } else if (Array.isArray(tags)) {
      tagsArray = tags;
    }
  }

  const createdPost = await Post.create({
    title,
    content,
    mediaImage: thumbnail.url,
    owner: req.user._id,
    tags: tagsArray,
    isPublished: isPublished === "true" || isPublished === true,
    contentVector: embedding,
  });

  return res
    .status(201)
    .json(new Apiresponse(201, createdPost, "Post created successfully"));
});

//home feed
const getAllPost = Asynchandler(async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;

  // BASIC FILTER
  const filter = {
    isPublished: true,
  };

  // Category filter
  if (category && category !== "All") {
    filter.tags = {
      $regex: new RegExp(`^${category}$`, "i"),
    };
  }

  // LATEST POSTS
  const latestPosts = async () => {
    const result = await paginateQuery(Post, filter, page, limit, {
      populate: {
        path: "owner",
        select: "username avatar",
      },
      sort: {
        createdAt: -1,
      },
    });

    return res
      .status(200)
      .json(new Apiresponse(200, result, "Posts fetched successfully"));
  };

  // PERSONALIZATION CHECK
  const vector = req.user?.userIntrestVector;

  const behavioralSignalCount = req.user?.behavioralSignalCount ?? 0;

  const hasValidVector =
    Array.isArray(vector) &&
    vector.length === 384 &&
    vector.some((value) => value !== 0);

  const hasExplicitProfile =
    Array.isArray(req.user?.explicitPreferences) &&
    req.user.explicitPreferences.length > 0;

  const hasEnoughBehavioralData = behavioralSignalCount >= 3;

  const shouldUsePersonalizedFeed =
    hasValidVector && (hasExplicitProfile || hasEnoughBehavioralData);

  // COLD START / NOT READY
  if (!shouldUsePersonalizedFeed) {
    console.log("🧊 Using latest feed", {
      hasExplicitProfile,
      behavioralSignalCount,
      hasValidVector,
    });

    return latestPosts();
  }

  // PERSONALIZED FEED
  console.log("🎯 Using personalized feed", {
    hasExplicitProfile,
    behavioralSignalCount,
  });

  // Match stage
  const matchStage = {
    isPublished: true,
  };

  // Category filter
  if (category && category !== "All") {
    matchStage.tags = {
      $regex: new RegExp(`^${category}$`, "i"),
    };
  }

  const smartFeed = [
    {
      $vectorSearch: {
        index: "vector_index",
        path: "contentVector",
        queryVector: vector,

        // Search enough candidates so pagination
        // has posts available to work with.
        numCandidates: 100,

        limit: 100,
      },
    },

    {
      $match: matchStage,
    },

    // Get author information
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

  console.log("🎯 PERSONALIZED PAGINATION:", result.pagination);
  console.log("🎯 PERSONALIZED POSTS:", result.data.length);

  if (!result?.data || result.data.length === 0) {
    console.log("No personalized posts found. Returning latest posts.");

    return latestPosts();
  }

  return res
    .status(200)
    .json(
      new Apiresponse(
        200,
        result,
        "User preference related posts fetched successfully",
      ),
    );
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
  const { title, content, tags } = req.body; // 1. Destructure tags
  const findPost = await Post.findById(postId);

  if (!findPost) {
    throw new Apierror(404, "Post not found");
  }

  if (findPost.owner.toString() !== req.user._id.toString()) {
    throw new Apierror(403, "unauthorize to perform update request");
  }

  if (title) {
    findPost.title = title;
  }

  if (content) {
    findPost.content = content;
  }

  // 2. Parse and update tags
  if (tags !== undefined) {
    let parsedTags = tags;

    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    findPost.tags = Array.isArray(parsedTags) ? parsedTags : [];
  }

  console.log("does file is coming", req.file);
  console.log("File received:", req.file);

  if (req.file) {
    const existingImage = findPost.mediaImage;
    console.log("Old Image URL:", existingImage);

    const newImage = await cloudinaryUploader(req.file.path);
    console.log("Cloudinary Upload Result:", newImage);

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

  return res
    .status(200)
    .json(new Apiresponse(200, update, "Post updated successfully"));
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

  return res
    .status(200)
    .json(new Apiresponse(200, result, "All posts fetched successfully"));
});

// Toggle status between Published and Draft
const togglePostStatus = Asynchandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    throw new Apierror(404, "Post not found");
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    throw new Apierror(403, "You are not authorized to perform this request");
  }

  // If the user is trying to PUBLISH (changing draft to true)
  if (!post.isPublished) {
    if (!post.content || post.content.length < 50) {
      throw new Apierror(
        400,
        "Content is too short to publish. Add some more details!",
      );
    }
  }

  post.isPublished = !post.isPublished;
  const updatedPost = await post.save();

  console.log("Saved publish state:", updatedPost.isPublished);

  const verify = await Post.findById(postId);
  console.log("Database state:", verify.isPublished);

  return res
    .status(200)
    .json(
      new Apiresponse(
        200,
        updatedPost,
        `Post ${updatedPost.isPublished ? "published" : "unpublished"} successfully`,
      ),
    );
});

const searchPostsDiscovery = Asynchandler(async (req, res) => {
  console.log("=== searchPostsDiscovery HIT ===");

  const { query, page = 1, limit = 10 } = req.query;

  if (!query || !query.trim()) {
    throw new Apierror(400, "Search query is required");
  }

  const searchQuery = query.trim();

  // Generate embedding for the search query
  const vector = await generateEmbedding(searchQuery);

  if (!vector || vector.length !== 384) {
    throw new Apierror(500, "Search embedding could not be generated");
  }

  /*
   * Get a larger semantic candidate pool first.
   *
   * We paginate AFTER relevance filtering.
   */
  const pipeline = [
    {
      $vectorSearch: {
        index: "vector_index",
        path: "contentVector",
        queryVector: vector,
        numCandidates: 100,
        limit: 50,
        filter: {
          isPublished: { $eq: true },
        },
      },
    },

    {
      $addFields: {
        searchScore: {
          $meta: "vectorSearchScore",
        },
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },

    {
      $unwind: "$owner",
    },

    {
      $project: {
        "owner.password": 0,
        "owner.refreshToken": 0,
        contentVector: 0,
      },
    },

    {
      $sort: {
        searchScore: -1,
      },
    },
  ];

  const candidates = await Post.aggregate(pipeline);

  /*
   * Normalize query.
   *
   * Example:
   * "  SuperHero  " -> "superhero"
   */
  const normalizedQuery = searchQuery.trim().toLowerCase();

  /*
   * Split query into individual words.
   *
   * "machine learning"
   * -> ["machine", "learning"]
   */
  const queryWords = normalizedQuery
    .split(/\s+/)
    .filter((word) => word.length >= 2);

  /*
   * --------------------------------------------------
   * RELEVANCE FILTER
   * --------------------------------------------------
   *
   * We use lexical evidence to validate semantic results.
   */
  const relevantPosts = candidates.filter((post) => {
    const title =
      typeof post.title === "string" ? post.title.toLowerCase() : "";

    const content =
      typeof post.content === "string" ? post.content.toLowerCase() : "";

    const tags = Array.isArray(post.tags)
      ? post.tags.map((tag) => String(tag).toLowerCase())
      : [];

    /*
     * Exact phrase match.
     *
     * Example:
     * query = "machine learning"
     *
     * title/content/tag containing the complete phrase
     * gets strong lexical evidence.
     */
    const exactPhraseMatch =
      title.includes(normalizedQuery) ||
      content.includes(normalizedQuery) ||
      tags.some((tag) => tag.includes(normalizedQuery));

    /*
     * Individual query-word matching.
     *
     * This helps multi-word queries such as:
     *
     * "machine learning"
     *
     * where the two words may appear separately.
     */
    const matchedWords = queryWords.filter(
      (word) =>
        title.includes(word) ||
        content.includes(word) ||
        tags.some((tag) => tag.includes(word)),
    );

    

    /*
     * Tag/title matches are particularly strong signals
     * because they represent explicit metadata/content
     * supplied by the author.
     */
    const titleMatch = title.includes(normalizedQuery);

    const tagMatch = tags.some((tag) => tag.includes(normalizedQuery));

    /*
     * For a single-word query:
     *
     * superhero -> Avengers
     *
     * tagMatch = true
     *
     * For:
     *
     * xyzabc123 -> random post
     *
     * no lexical evidence.
     */
    const strongLexicalMatch = exactPhraseMatch || titleMatch || tagMatch;

    /*
     * A semantic result is accepted only when there is
     * supporting lexical evidence.
     *
     * We deliberately do NOT use:
     *
     * searchScore >= 0.57
     *
     * by itself.
     */
    const hasLexicalEvidence =
      strongLexicalMatch ||
      (queryWords.length > 1 && matchedWords.length === queryWords.length);

    /*
     * Require a reasonable semantic relationship too.
     *
     * This prevents a completely unrelated post that
     * happens to contain one common query word from
     * automatically becoming a result.
     */
    const hasSemanticSupport = post.searchScore >= 0.45;

    const isRelevant = hasLexicalEvidence && hasSemanticSupport;

    return isRelevant;
  });

  /*
   * Debug information
   */
  console.log(
    "🔎 Search candidates:",
    candidates.map((post) => ({
      title: post.title,
      score: post.searchScore,
      tags: post.tags,
    })),
  );

  console.log(
    "✅ Relevant search results:",
    relevantPosts.map((post) => ({
      title: post.title,
      score: post.searchScore,
      tags: post.tags,
    })),
  );

  /*
   * --------------------------------------------------
   * PAGINATION
   * --------------------------------------------------
   */

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const totalItems = relevantPosts.length;

  const totalPages = Math.ceil(totalItems / limitNum);

  const skip = (pageNum - 1) * limitNum;

  const data = relevantPosts.slice(skip, skip + limitNum);

  const result = {
    data,

    pagination: {
      totalItems,
      totalPages,
      currentPage: pageNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };

  return res
    .status(200)
    .json(new Apiresponse(200, result, "Search results fetched successfully"));
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
      "views updated successfully",
    ),
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
