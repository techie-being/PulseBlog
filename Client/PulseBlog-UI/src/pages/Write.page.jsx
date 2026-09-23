import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import EditorComponent from "../components/Editor.component.jsx";
import axiosInstance from "../api/axiosInstance.js";
import toast, { Toaster } from "react-hot-toast";
import useAssetGenerator from "../hooks/useAssetGenerator.js";
import usePolishDraft from "../hooks/usePolishDraft.js";
import PolishPreviewModal from "../components/author-ai/PolishPreviewModal.jsx";
import AIWorkspaceModal from "../components/author-ai/AIWorkspaceModal.jsx";
import AssetGeneratorModal from "../components/author-ai/AssetGeneratorModal.jsx";

const WritePage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const editorRef = useRef(null);

  const { isLoggedIn } = useSelector((state) => state.auth);

  // --- STATE ---
  const [showAIWorkspace, setShowAIWorkspace] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [tags, setTags] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [assets, setAssets] = useState(null);
  const [openAssetModal, setOpenAssetModal] = useState(false);

  const {
    loading: polishLoading,
    review,
    titleSuggestion,
    headingSuggestions,
    tagSuggestions,
    paragraphSuggestions,
    showPreview,
    setShowPreview,
    runPolish,
  } = usePolishDraft();

  const { generate, loading: assetLoading } = useAssetGenerator();

  // Load existing post data if editing
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsFetching(true);
        const res = await axiosInstance.get(`/posts/get-post/${postId}`);
        const responseData = res.data?.data || res.data;
        const post = responseData.post || responseData;

        setTitle(post.title || "");
        setTags(
          Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || ""
        );
        setThumbnailPreview(post.mediaImage || "");

        const parsedContent =
          typeof post.content === "string"
            ? JSON.parse(post.content)
            : post.content;

        setContent(parsedContent);

        if (editorRef.current && parsedContent) {
          await editorRef.current.render(parsedContent);
        }
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to fetch post details"
        );
        navigate("/dashboard");
      } finally {
        setIsFetching(false);
      }
    };

    if (isLoggedIn) {
      if (postId) {
        fetchPost();
      } else {
        setIsFetching(false);
      }
    } else {
      navigate("/signin");
    }
  }, [postId, isLoggedIn, navigate]);

  // Thumbnail handler
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      return toast.error("Image must be under 100KB");
    }

    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  // Helper function to safely set tags formatted as a comma-separated string
  const handleSetTags = (incomingTags) => {
    if (Array.isArray(incomingTags)) {
      setTags(incomingTags.join(", "));
    } else if (typeof incomingTags === "string") {
      setTags(incomingTags);
    } else {
      setTags("");
    }
  };

  // Publish / Save Draft Logic
  const handlePublish = useCallback(
    async (isPublished) => {
      let currentContent = content;

      if (editorRef.current) {
        try {
          const latestData = await editorRef.current.save();
          if (latestData) currentContent = latestData;
        } catch (e) {
          console.warn("Editor save failed, fallback to state content", e);
        }
      }

      if (!title.trim()) {
        toast.error("Title is required");
        return null;
      }

      if (
        !currentContent ||
        !currentContent.blocks ||
        currentContent.blocks.length === 0
      ) {
        toast.error("Write something in the editor first!");
        return null;
      }

      if (!postId && !thumbnail) {
        toast.error("Thumbnail image is required");
        return null;
      }

      setPublishLoading(true);

      try {
        const form = new FormData();
        form.append("title", title);
        form.append("content", JSON.stringify(currentContent));
        if (thumbnail) form.append("mediaImage", thumbnail);
        form.append("isPublished", isPublished);

        // Ensure tags are cleaned up and formatted before sending to server
        const formattedTags = Array.isArray(tags)
          ? tags.join(",")
          : typeof tags === "string"
          ? tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
              .join(",")
          : "";

        form.append("tags", formattedTags);

        let response;
        if (postId) {
          response = await axiosInstance.patch(
            `/posts/update-post/${postId}`,
            form
          );
          toast.success(isPublished ? "Post updated!" : "Draft updated!");
        } else {
          response = await axiosInstance.post("/posts/create-post", form);
          toast.success(isPublished ? "Post published!" : "Draft saved!");
        }

        const resData = response.data?.data || response.data;
        const targetId = postId || resData?._id || resData?.id;

        navigate("/dashboard");
        return targetId;
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to save post");
        return null;
      } finally {
        setPublishLoading(false);
      }
    },
    [content, title, thumbnail, tags, postId, navigate]
  );

  // AI Assets Generator Handler
  const handleGenerateAssets = async () => {
    let currentPostId = postId;

    if (!currentPostId) {
      const toastId = toast.loading("Saving draft first to generate assets...");
      currentPostId = await handlePublish(false);
      toast.dismiss(toastId);

      if (!currentPostId) {
        return toast.error("Please save draft before generating assets.");
      }
    }

    try {
      const data = await generate(currentPostId);
      setAssets(data);
      setOpenAssetModal(true);
      setShowAIWorkspace(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate assets");
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-slate-50/60">
        <p className="text-slate-400 text-lg font-semibold animate-pulse">
          Loading editor...
        </p>
      </div>
    );
  }

  return (
    <section className="w-full min-h-screen bg-slate-50/60 text-slate-900 transition-colors">
      <Toaster position="top-center" />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header Title */}
        <h1
          className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 sm:mb-8 text-slate-900"
          style={{ color: "#0f172a" }}
        >
          {postId ? "Edit Post" : "New Post"}
        </h1>

        {/* Thumbnail Uploader Container */}
        <div
          className="w-full aspect-video max-h-[220px] sm:max-h-[360px] bg-slate-900 rounded-2xl mb-6 cursor-pointer overflow-hidden relative group border-2  border-slate-200 hover:border-indigo-400 transition-all flex items-center justify-center shadow-sm"
          onClick={() => fileRef.current?.click()}
        >
          {thumbnailPreview ? (
            <img
              src={thumbnailPreview}
              alt="Thumbnail Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 p-6 text-center">
              <i className="fi fi-rr-picture text-3xl sm:text-5xl mb-2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                Click to add a thumbnail image
              </p>
              <span className="text-[10px] sm:text-xs text-slate-400 mt-1">
                Max file size: 100KB
              </span>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleThumbnailChange}
        />

        {/* Post Title Input */}
        <div className="relative mb-6 sm:mb-8 w-full max-w-full overflow-hidden">
          <input
            type="text"
            placeholder="Post Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl sm:text-4xl font-extrabold tracking-tight outline-none border-b-2 border-slate-200 focus:border-indigo-600 bg-transparent pb-3 sm:pb-4 text-slate-900 placeholder:text-slate-300 transition-colors break-words overflow-x-auto whitespace-normal"
            style={{ color: "#0f172a", caretColor: "#0f172a" }}
          />
        </div>

        {/* Tags Input */}
        <div className="w-full mb-6 sm:mb-8">
          <input
            type="text"
            placeholder="Tags (comma separated e.g. react, webdev)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-white text-slate-900 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium outline-none border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 shadow-sm"
            style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
          />
        </div>

        {/* Editor Container Surface */}
        <div className="w-full min-h-[300px] sm:min-h-[400px] bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm mb-8">
          <EditorComponent
            ref={editorRef}
            initialContent={content}
            onChange={setContent}
          />
        </div>

        {/* Action Bar */}
        <div className="w-full border-t border-slate-200 pt-6 mb-16 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setShowAIWorkspace(true)}
            className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl sm:rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-500/10"
          >
            <span className="text-sm">✨</span> Use AI Workspace
          </button>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={publishLoading}
              onClick={() => handlePublish(false)}
              className="flex-1 sm:flex-initial px-5 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl sm:rounded-full text-xs sm:text-sm transition-all disabled:opacity-50 active:scale-95 text-center shadow-sm"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={publishLoading}
              onClick={() => handlePublish(true)}
              className="flex-1 sm:flex-initial px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl sm:rounded-full text-xs sm:text-sm transition-all disabled:opacity-50 active:scale-95 text-center shadow-md shadow-indigo-500/20"
            >
              {publishLoading
                ? "Processing..."
                : postId
                ? "Update Post"
                : "Publish"}
            </button>
          </div>
        </div>

        {/* AI Modals */}
        <AIWorkspaceModal
          open={showAIWorkspace}
          onClose={() => setShowAIWorkspace(false)}
          loading={polishLoading}
          assetLoading={assetLoading}
          onPolish={() => {
            runPolish(
              {
                title,
                tags,
                content,
              },
              postId
            );
            setShowAIWorkspace(false);
          }}
          onAssets={handleGenerateAssets}
        />

        <PolishPreviewModal
          open={showPreview}
          review={review}
          titleSuggestion={titleSuggestion}
          headingSuggestions={headingSuggestions}
          tagSuggestions={tagSuggestions}
          paragraphSuggestions={paragraphSuggestions}
          content={content}
          setContent={(newContent) => {
            setContent(newContent);
            if (editorRef.current) {
              editorRef.current.render(newContent);
            }
          }}
          editorRef={editorRef}
          setTitle={setTitle}
          setTags={handleSetTags}
          onClose={() => setShowPreview(false)}
        />

        <AssetGeneratorModal
          open={openAssetModal}
          assets={assets}
          onClose={() => setOpenAssetModal(false)}
        />
      </div>
    </section>
  );
};

export default WritePage;