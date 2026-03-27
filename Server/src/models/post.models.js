import mongoose,{Schema} from "mongoose";
import { User } from "./user.models";
import { nanoid } from "nanoid";
import slugify from "slugify";

const postSchema = new Schema(
    {
        title:{
            type:String,
            required:true,
            index:true,
            trim:true
        },

        content:{
            type:String,
            required:true,
            
        },
        
        //store title and content as vector for better serach results
        contentVector:{
            type:[Number],
            default:() => new Array(384).fill(0)
        },

        mediaImage:{
            type:String,
            required:true,  
        },

        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },

        views:{
            type:Number,
            default:0,
        },

        //tags defailt [] to prevent frontend errors when ther is no post
        tags:{
            type:[String],
            default:[]
        },

        slug: { 
            type: String, 
            unique: true, 
            index: true 
        },

        likeCount:{
            type:Number,
            default:0
        },

        commentCount:{
            type:Number,
            default:null,
        },

        shareCount:{
            type:Number,
            default:0
        },

        isPublished:{
            type:Boolean,
            default:false
        }


    },
    {timestamps:true}
)


postSchema.post("save", async function (doc, next) {
    try {
        await mongoose.model("User").findByIdAndUpdate(doc.owner, {
            $inc: { postsCount: 1 }
        });
        next();
    } catch (error) {
        next(error);
    }
});


postSchema.post("findOneAndDelete", async function (doc, next) {
    try {
        if (doc) {
            await mongoose.model("User").findByIdAndUpdate(doc.owner, {
                $inc: { postsCount: -1 }
            });
        }
        next();
    } catch (error) {
        next(error);
    }
});

postSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { 
      lower: true,   
      strict: true,  
      trim: true     
    });
    this.slug = `${baseSlug}-${nanoid(6)}`;
  }
  next();
});
//for search bar using title
postSchema.index({ title: 'text', content: 'text' });
export const Post = mongoose.model("Post",postSchema)