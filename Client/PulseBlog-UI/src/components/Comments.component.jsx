import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { isLoggedIn } = useSelector((state) => state.auth);

  const fetchComments = async () => {
    try {
      // FIXED: Changed .get() to .post() to match the backend route definition.
      // Even though we are fetching data, the backend specifically expects a POST request here.
      const res = await axiosInstance.post(`/comment/get-comments/${postId}`);
      setComments(res.data.data?.data || []); // pagination wraps in {data, pagination}
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return toast.error("Please sign in to comment.");
    if (!newComment.trim()) return toast.error("Comment cannot be empty.");

    try {
      await axiosInstance.post(`/comment/comment/${postId}`, {
        // FIXED: Changed 'content' to 'commentText' to match backend middleware
        commentText: newComment 
      });
      setNewComment("");
      toast.success("Comment added!");
      fetchComments();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add comment");
    }
  };
  return (
    <div className="mt-12 pt-8 border-t border-grey">
      <h3 className="font-inter text-xl font-bold mb-6">
        Comments ({comments.length})
      </h3>

      <form onSubmit={handleCommentSubmit} className="flex gap-4 mb-8">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="input-box w-full pl-4"
        />
        <button type="submit" className="btn-dark px-6 py-2">Post</button>
      </form>

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-dark-grey text-center">No comments yet.</p>
        ) : (
          comments.map((c) => (
            <div key={c._id} className="p-4 bg-grey rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  {c.commentUserId?.avatar && (
                    <img
                      src={c.commentUserId.avatar}
                      className="w-6 h-6 rounded-full object-cover"
                      alt=""
                    />
                  )}
                  {/* FIX: was c.owner?.username — backend field is commentUserId */}
                  <p className="font-medium text-sm capitalize">
                    {c.commentUserId?.username || "User"}
                  </p>
                </div>
                <p className="text-xs text-dark-grey">
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-dark-grey">{c.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;