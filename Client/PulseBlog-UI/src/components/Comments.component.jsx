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
        commentText: newComment,
      });
      setNewComment("");
      toast.success("Comment added!");
      fetchComments();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add comment");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-grey">
      <h3 className="font-inter text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
        Comments ({comments.length})
      </h3>

      {/* Auto-Expanding Input Container with Embedded Post Button */}
      <form
        onSubmit={handleCommentSubmit}
        className="relative w-full mb-6 sm:mb-8"
      >
        <textarea
          rows={2}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="input-box w-full pl-4 pr-24 pt-3 pb-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple/50 rounded-xl resize-none min-h-[90px] block"
        />
        <button
          type="submit"
          className="btn-dark absolute right-2 bottom-2 px-4 sm:px-5 py-1.5 text-xs sm:text-sm shrink-0 transition-transform duration-100 active:scale-95 rounded-lg z-10"
        >
          Post
        </button>
      </form>

      {/* Comment List Container */}
      <div className="space-y-4 sm:space-y-6">
        {comments.length === 0 ? (
          <p className="text-dark-grey text-center py-6 text-sm sm:text-base">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c._id}
              className="p-3.5 sm:p-5 bg-grey rounded-xl transition-all duration-200 block w-full"
            >
              <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 mb-2 sm:mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {c.commentUserId?.avatar?.url ? (
                    <img
                      src={c.commentUserId.avatar.url}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0"
                      alt={c.commentUserId?.username || "User avatar"}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple/20 text-purple flex items-center justify-center font-bold text-xs shrink-0">
                      {(c.commentUserId?.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <p className="font-semibold text-xs sm:text-sm truncate text-slate-800">
                    {c.commentUserId?.username || "User"}
                  </p>
                </div>
                <p className="text-[11px] sm:text-xs text-dark-grey shrink-0">
                  {new Date(c.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <p className="text-dark-grey text-sm sm:text-base leading-relaxed break-all sm:break-words whitespace-pre-wrap pl-0 sm:pl-10 w-full">
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
