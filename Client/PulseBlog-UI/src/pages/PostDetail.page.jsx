import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance.js";
import BlockRenderer from "../components/BlockRenderer.component.jsx";
import PostCard from "../components/PostCard.component.jsx";
import Comments from "../components/Comments.component.jsx";
import useGenerateSummary from "../hooks/useGenerateSummary.js";
import SummaryModal from "../Components/user-ai/SummaryModal.jsx";
import useSimplifyText from "../hooks/useSimplifyText.js";
import TextSelectionPopup from "../Components/user-ai/TextSelectionPopup.jsx";
import AskAIModal from "../Components/user-ai/AskAIModal.jsx";

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [popupPosition, setPopupPosition] = useState({
    x: 0,
    y: 0,
  });
  const [showPopup, setShowPopup] = useState(false);
  const [showAskAI, setShowAskAI] = useState(false);

  // State for likes
  const [isLiked, setIsLiked] = useState(false);
  const { isLoggedIn } = useSelector((state) => state.auth);

  const { generate, loading: summaryLoading } = useGenerateSummary();
  const { askAI, result, loading: aiLoading } = useSimplifyText();

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchPost = async () => {
      try {
        setLoading(true);

        // Fetch main post data and related posts
        const res = await axiosInstance.get(`/posts/get-post/${postId}`);
        setPost(res.data.data.post);
        setRelated(res.data.data.relatedPosts || []);

        // Fire off view count increment quietly
        axiosInstance.get(`/posts/views/${postId}`).catch(() => {});

        // Fetch real like status if the user is authenticated
        if (isLoggedIn) {
          try {
            const likeRes = await axiosInstance.get(
              `/like/post-like-status/${postId}`,
            );
            setIsLiked(likeRes.data.data === true);
          } catch (err) {
            console.error("Could not fetch like status", err);
          }
        }
      } catch (err) {
        console.error("Failed to load post", err);
        // Handle 404 naturally via the post null check below
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, isLoggedIn]);

  const handleLikeToggle = async () => {
    if (!isLoggedIn) return toast.error("Sign in to like this post!");

    // 1. Save previous state in case of error
    const previousLikedStatus = isLiked;

    // 2. Update UI immediately (Optimistic)
    setIsLiked(!previousLikedStatus);

    try {
      if (previousLikedStatus) {
        await axiosInstance.patch(`/like/unlike-post/${postId}`);
      } else {
        await axiosInstance.patch(`/like/post-liked/${postId}`);
      }
    } catch (err) {
      // 3. Rollback if the server fails
      setIsLiked(previousLikedStatus);
      toast.error(
        err?.response?.data?.message || "Failed to update like status",
      );
    }
  };

  const handleGenerateSummary = async () => {
    try {
      const data = await generate(post.content);

      setSummaryData(data);

      setShowSummaryModal(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate summary");
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (!text || selection.rangeCount === 0) {
      setShowPopup(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectedText(text);

    // Using absolute positioning (with page scroll offsets) so the popup follows the exact document flow 
    // rather than staying fixed to the viewport window.
    setPopupPosition({
      x: rect.left + rect.width / 2 + window.pageXOffset,
      y: rect.top + window.pageYOffset - 10, // Positioned right above the highlighted text
    });

    setShowPopup(true);
  };

  const handleAskAI = async () => {
    try {
      await askAI(selectedText);

      setShowPopup(false);

      setShowAskAI(true);

      window.getSelection()?.removeAllRanges();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to simplify text");
    }
  };

  if (loading) {
    return (
      <section className="max-w-3xl mx-auto animate-pulse space-y-6 py-8">
        <div className="w-full aspect-video bg-grey rounded-xl" />
        <div className="h-8 w-3/4 bg-grey rounded" />
        <div className="h-4 w-1/2 bg-grey rounded" />
      </section>
    );
  }

  if (!post) {
    return (
      <section className="text-center py-24">
        <p className="text-xl text-dark-grey">Post not found.</p>
        <Link to="/" className="btn-dark mt-6 inline-block">
          Go Home
        </Link>
      </section>
    );
  }

  let blocks = [];
  try {
    const parsed = JSON.parse(post.content);
    blocks = parsed.blocks || [];
  } catch {
    blocks = [];
  }

  return (
    <section>
      <div className="max-w-3xl mx-auto">
        <img
          src={post.mediaImage}
          alt={post.title}
          className="w-full aspect-video object-cover rounded-xl mb-8"
        />

        <h1 className="font-inter text-4xl font-bold mb-4 leading-snug">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 mb-8">
          <img
            src={post.owner?.avatar}
            alt={post.owner?.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <Link
              to={`/user/${post.owner?.username}`}
              className="font-medium capitalize hover:underline"
            >
              {post.owner?.username}
            </Link>
            <p className="text-sm text-dark-grey">
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" · "}
              {post.views} views
            </p>
          </div>
        </div>

        {/* LIKE BUTTON */}
        <div className="flex gap-4 items-center my-6">
          <button
            onClick={handleLikeToggle}
            className={`w-10 h-10 rounded-full flex items-center justify-center bg-grey ${isLiked ? "text-red-500" : "text-black"}`}
          >
            <i
              className={`fi ${isLiked ? "fi-sr-heart" : "fi-rr-heart"} text-xl`}
            />
          </button>
        </div>

        <div className="flex items-center gap-4 my-6">
          <button
            onClick={handleGenerateSummary}
            disabled={summaryLoading}
            className="group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray-900 bg-white border border-gray-300 shadow-md shadow-gray-200/50 hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none transition-all duration-300"
          >
            {summaryLoading ? (
              <>
                {/* Animated Loading Spinner */}
                <svg
                  className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-gray-900"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span className="text-xs transition-transform duration-300 group-hover:rotate-12">
                  ✨
                </span>
                <span>Generate Summary</span>
              </>
            )}
          </button>
        </div>

        {/* POST CONTENT */}
        <div onMouseUp={handleTextSelection}>
          <BlockRenderer blocks={blocks} />
        </div>

        {/* COMMENTS SECTION */}
        <Comments postId={post._id} />

        {post.tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-10 pt-6 border-t border-grey">
            {post.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="font-inter text-xl font-bold mb-4">Related Posts</h3>
            {related.map((p, i) => (
              <PostCard key={p._id} post={p} index={i} />
            ))}
          </div>
        )}
      </div>

      <SummaryModal
        open={showSummaryModal}
        data={summaryData}
        onClose={() => setShowSummaryModal(false)}
      />

      <TextSelectionPopup
        visible={showPopup}
        position={popupPosition}
        onAskAI={handleAskAI}
        loading={aiLoading}
      />

      <AskAIModal
        open={showAskAI}
        loading={aiLoading}
        result={result}
        onClose={() => setShowAskAI(false)}
      />
    </section>
  );
};

export default PostDetail;
