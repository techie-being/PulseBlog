import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Asynchandler.js";
import { Apiresponse } from "../utils/Asynchandler.js";
import { cloudinaryUploader } from "../utils/Cloudinary.js";
import { post, post } from "../models/post.models.js";

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
  const embedding = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: `${title} ${content}`,
  });

  const createdPost = await post.create({
    title,
    content,
    mediaImage: thumbnail.url,
    owner: req.user._id,
    tags: tags || [],
    isPublished: req.user.status || false,
    contentVector: embedding,
  });

  return res
    .status(201)
    .json(new Apiresponse(201, createdPost, "Post created successfully"));
});

const getAllPost = Asynchandler(async (req, res) => {
  const guest = !req.user;

  if (guest) {
    const Post = await post
      .find({ isPublished: true })
      .populate("owner", "username ", "avatar")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new Apiresponse(200, latestPost, "posts fetched successfully"));
  }

  const smartFeed = Asynchandler(async (req,res) => {
    
                
  })


});
export { createPost };
