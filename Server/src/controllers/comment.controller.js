import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import {User} from "../models/user.models.js"
import {Post} from "../models/post.models.js"
import {paginateQuery} from "../utils/pagination.js"

//when we write a route for this we use commentfiltermiddlewarw before 
// this controller
const userComment = Asynchandler(async (req,res) => {
    const {postId} = req.params;

 //maybe frontend send a object as parameter
    const {content} = req.body;

    const userId = req.user._id;

    const post = await Post.findById(postId);

    if(!post){
        throw new Apierror(400,"post does not exist")
    }

    const newComment = await Comment.create(
        {
            commentUserId:userId,
            content:content,
            postId:postId,
        }
    )

    const updatePost = await Post.findByIdAndUpdate(
        postId,
        {
            $inc:{
                commentCount:1
            }
        },
        {new:true}
    )

    return res
    .status(200)
    .json(
        new Apiresponse(
            {
                status:200,
                comment:newComment,
                totalComment:updatePost.commentCount,
                message:"User comment crated successfully"
            }
        )
    )
})

const deleteComment = Asynchandler(async (req,res) => {
    const {commentId} = req.params;

    const userId = req.user._id;

    const existingComment = await Comment.findById({commentId});
    
    if(!existingComment){
        throw new Apierror(404,"comment does not exist");
    }

    if (existingComment.commentUserId.toString() !== userId.toString()) {
        throw new Apierror(403, "You do not have permission to delete this comment");
    }

    await Comment.findByIdAndDelete(
        commentId,
    );
    
    const updatePost = await Post.findByIdAndUpdate(
        existingComment.postId,
        {
            $inc:{commentCount:-1}
        },
        {new:true}
    )

    return res
    .status(200)
    .json(
        new Apiresponse(
            {
                status:200,
                data:updatePost.commentCount,
                message:"user deleted comment successfully"
            }
        )
    )

})

const updateComment = Asynchandler(async (req,res) => {
    const {commentId} = req.params;

    const {newContent} = req.body;

    if(!newContent){
        throw new Apierror(404,"no content found inside");
    }

    const userId = req.user._id;

    const isCommentExisted = await Comment.findById(commentId);

    if(!isCommentExisted){
        throw new Apierror(404,"comment does not exist");
    }

    if(isCommentExisted.commentUserId.toString() !== userId.toString()){
        throw new Apierror(401,"user unauthorize to perform this action");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        //set is used to update eixting comment
        {
            $set:{content:newContent}
        },
        {new:true}
    )

    return res
    .status(200)
    .json(
        new Apiresponse({
            status:200,
            data:updatedComment,
            message:"user updated his comment successfully"
        })
    )
})

const getPostComments = Asynchandler(async (req, res) => {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await paginateQuery(
        Comment,
        { postId },
        page,
        limit,
        { 
            populate: { path: "commentUserId", select: "username avatar" },
            sort: { createdAt: -1 } 
        }
    );

    return res.status(200).json(
        new Apiresponse({
            status: 200,
            data: result,
            message: "Comments fetched successfully",
        })
    );
});

export {
    userComment,
    deleteComment,
    updateComment,
    getPostComments
}
