import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance.js";
import BlockRenderer from "../components/BlockRenderer.component.jsx";
import Comments from "../components/Comments.component.jsx";

import useGenerateSummary from "../hooks/useGenerateSummary.js";
import SummaryModal from "../components/user-ai/SummaryModal.jsx";
import useSimplifyText from "../hooks/useSimplifyText.js";

import TextSelectionPopup from "../components/user-ai/TextSelectionPopup.jsx";
import RedirectToSignin from "../components/Redirect.signin.jsx";
import AskAIModal from "../components/user-ai/AskAIModal.jsx";

const PostDetail = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const [showAskAI, setShowAskAI] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(10);
  // Like state
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

        const postData = res.data?.data?.post || res.data?.data;

        setPost(postData);

        // Track views quietly

        axiosInstance.get(`/posts/views/${postId}`).catch(() => {});

        // Fetch user like status if authenticated

        if (isLoggedIn) {
          try {
            const likeRes = await axiosInstance.get(
              `/like/post-like-status/${postId}`,
            );

            setIsLiked(likeRes.data?.data === true);
          } catch (err) {
            console.error("Could not fetch like status", err);
          }
        }
      } catch (err) {
        console.error("Failed to load post", err);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, isLoggedIn]);

  // 10 second countdown effect for guest users
  useEffect(() => {
    if (!isLoggedIn && post) {
      if (timeLeft <= 0) {
        navigate("/signin", { replace: true });
        return;
      }

      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLoggedIn, post, timeLeft, navigate]);

  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      return toast.error("Sign in to like this post!");
    }

    const previousLikedStatus = isLiked;

    console.log("BEFORE CLICK:", previousLikedStatus);

    setIsLiked(!previousLikedStatus);

    try {
      if (previousLikedStatus) {
        console.log("CALLING UNLIKE");

        await axiosInstance.patch(`/like/unlike-post/${postId}`);
      } else {
        console.log("CALLING LIKE");

        await axiosInstance.patch(`/like/post-liked/${postId}`);
      }

      console.log("LIKE REQUEST SUCCESS");
    } catch (err) {
      console.log("LIKE REQUEST FAILED:", err?.response?.data);

      setIsLiked(previousLikedStatus);

      toast.error(
        err?.response?.data?.message || "Failed to update like status",
      );
    }
  };

  const handleGenerateSummary = async () => {
    if (!post?.content) return;

    try {
      const data = await generate(post.content);

      setSummaryData(data);

      setShowSummaryModal(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate summary");
    }
  };

  const handleTextSelection = () => {
    // Small delay lets mobile browsers finish native text selection
    setTimeout(() => {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0) {
        return;
      }

      const text = selection.toString().trim();

      if (!text) {
        setShowPopup(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (!rect.width && !rect.height) {
        return;
      }

      setSelectedText(text);

      setPopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 12,
      });

      setShowPopup(true);
    }, 50);
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
      <section className="max-w-3xl mx-auto animate-pulse space-y-6 py-10 px-4">
        <div className="w-full aspect-video bg-grey/60 dark:bg-gray-800 rounded-2xl" />

        <div className="h-10 w-3/4 bg-grey/60 dark:bg-gray-800 rounded-lg" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-grey/60 dark:bg-gray-800" />

          <div className="h-4 w-1/3 bg-grey/60 dark:bg-gray-800 rounded" />
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="text-center py-28 px-4">
        <div className="w-16 h-16 bg-grey/40 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          <i className="fi fi-rr-document-signed text-dark-grey" />
        </div>

        <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
          Post not found
        </p>

        <p className="text-xs text-dark-grey mb-6">
          The article you are looking for may have been moved or removed.
        </p>

        <Link
          to="/"
          className="btn-dark py-2.5 px-6 rounded-full text-sm inline-block"
        >
          Return to Home
        </Link>
      </section>
    );
  }

  let blocks = [];

  try {
    const parsed =
      typeof post.content === "string"
        ? JSON.parse(post.content)
        : post.content;

    blocks = parsed?.blocks || [];
  } catch {
    blocks = [];
  }

  return (
    <section className="py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Cover Image */}

        {post.mediaImage?.url && (
          <img
            src={post.mediaImage.url}
            alt={post.title}
            className="w-full aspect-video object-cover rounded-2xl mb-8 border border-grey/50 shadow-sm"
          />
        )}

        {/* Title */}

        <h1 className="font-gelasio text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight text-gray-900 ">
          {post.title}
        </h1>

        {/* Author Header */}

        <div className="flex items-center justify-between border-b border-grey/60 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <img
              src={
                post.owner?.avatar?.url ||
                "https://api.dicebear.com/7.x/initials/svg?seed=Author"
              }
              alt={post.owner?.username}
              className="w-11 h-11 rounded-full object-cover border border-grey"
            />

            <div>
              <Link
                to={`/user/${post.owner?.username}`}
                className="font-medium text-sm text-gray-900  capitalize hover:underline"
              >
                {post.owner?.username || "Anonymous"}
              </Link>

              <p className="text-xs text-dark-grey mt-0.5">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",

                  month: "short",

                  day: "numeric",
                })}
                {" · "}
                {post.views || 0} views
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar (Like & AI Tools) */}

        <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
          {/* Like Button */}

          <button
            type="button"
            onClick={handleLikeToggle}
            className={`
    w-9 h-9
    sm:w-10 sm:h-10
    rounded-full
    flex items-center justify-center
    border
    transition-all duration-200
    active:scale-75
    ${
      isLiked
        ? "bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100"
        : "bg-white text-black border-black hover:bg-gray-100"
    }
  `}
            title={isLiked ? "Unlike post" : "Like post"}
          >
            <i
              className={`
      fi
      ${isLiked ? "fi-sr-heart" : "fi-rr-heart"}
      text-base
      sm:text-lg
    `}
            />
          </button>

          {/* AI Summary Button */}

          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={summaryLoading}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 h-9 sm:h-10 rounded-full text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all duration-200 active:scale-95 disabled:opacity-60 shrink-0"
          >
            {summaryLoading ? (
              <>
                <svg
                  className="animate-spin h-3.5 w-3.5 text-slate-700 dark:text-slate-300"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>

                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <span className="text-xs">✨</span>

                <span>AI Summary</span>
              </>
            )}
          </button>
        </div>

        {/* Article Content */}

        <div
          onMouseUp={handleTextSelection}
          onTouchEnd={handleTextSelection}
          className="max-w-none mb-12"
        >
          <BlockRenderer blocks={blocks} />
        </div>

        {/* Tags */}

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 w-full h-auto min-h-fit pb-8 mb-8 border-b border-grey/60 overflow-visible">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium bg-grey/50 dark:bg-gray-800 text-dark-grey px-3 py-1.5 rounded-full break-words max-w-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Timer Banner (placed below tags and above comments) */}
        {!isLoggedIn && (
          <div className="mb-8">
            <RedirectToSignin timeLeft={timeLeft} />
          </div>
        )}

        {/* Comments Section */}

        <Comments postId={post._id} />
      </div>

      {/* AI Context Modals */}

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
