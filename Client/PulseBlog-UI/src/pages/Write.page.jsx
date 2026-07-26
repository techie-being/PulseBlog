import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import EditorComponent from "../components/Editor.component";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

import usePolishDraft from "../hooks/usePolishDraft.js";
import PolishPreviewModal from "../Components/author-ai/PolishPreviewModal.jsx";
import AIWorkspaceModal from "../Components/author-ai/AIWorkspaceModal.jsx";

const WritePage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);
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

  //editor
  const editorRef = useRef(null);

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

  const handleApplySuggestion = (suggestion) => {
    const updatedContent = structuredClone(content);

    updatedContent.blocks[suggestion.blockIndex].data.text =
      suggestion.improved;

    setContent(updatedContent);

    editorRef.current?.render(updatedContent);

    toast.success("Suggestion applied.");
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axiosInstance.get(`/posts/get-post/${postId}`);
        const responseData = res.data?.data || res.data;
        const post = responseData.post || responseData;

        setTitle(post.title || "");
        setTags(
          Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "",
        );
        setThumbnailPreview(post.mediaImage || "");

        const parsedContent =
          typeof post.content === "string"
            ? JSON.parse(post.content)
            : post.content;
        setContent(parsedContent);
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to fetch post details",
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
      navigate("/signin"); // Safety redirect
    }
  }, [postId, isLoggedIn, navigate]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 100 * 1024) return toast.error("Image must be under 100KB");
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  // controller1 it should call generate summary as well in this same manner

  const extractTextFromEditor = () => {
    if (!content?.blocks) return "";

    return content.blocks
      .map((block, index) => {
        if (block.type !== "paragraph" && block.type !== "header") return "";

        return `[BLOCK ${index}]
${block.data.text}`;
      })
      .filter(Boolean)
      .join("\n\n");
  };

  const handlePublish = async (isPublished) => {
    if (!title.trim()) return toast.error("Title is required");
    if (!content) return toast.error("Write something first!");
    if (!postId && !thumbnail)
      return toast.error("Thumbnail image is required");

    setPublishLoading(false);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("content", JSON.stringify(content));
      if (thumbnail) form.append("mediaImage", thumbnail);
      form.append("isPublished", isPublished);
      form.append("tags", tags);

      if (postId) {
        await axiosInstance.patch(`/posts/update-post/${postId}`, form);
        toast.success(isPublished ? "Post updated!" : "Draft updated!");
      } else {
        await axiosInstance.post("/posts/create-post", form);
        toast.success(isPublished ? "Post published!" : "Draft saved!");
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save post");
    } finally {
      setPublishLoading(true);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-dark-grey text-xl animate-pulse">
          Loading editor...
        </p>
      </div>
    );
  }

  return (
    <section>
      <Toaster />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">
          {postId ? "Edit Post" : "New Post"}
        </h1>

        <div
          className="w-full aspect-video bg-grey rounded-xl mb-6 cursor-pointer overflow-hidden relative group"
          onClick={() => fileRef.current.click()}
        >
          {thumbnailPreview ? (
            <img
              src={thumbnailPreview}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-dark-grey p-10">
              <i className="fi fi-rr-picture text-4xl block mb-2" />
              <p>Add Thumbnail (Max 100KB)</p>
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

        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Post Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold outline-none border-b border-grey pb-4 pr-[140px]"
          />
        </div>

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="input-box mb-6"
        />

        <EditorComponent
          ref={editorRef}
          initialContent={content}
          onChange={setContent}
        />

        <div className="mt-10 border-t border-grey pt-6 flex items-center justify-between">
          {/* Left */}
          <button
            onClick={() => setShowAIWorkspace(true)}
            className="btn-dark transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
          >
            ✨ Use AI
          </button>

          {/* Right */}
          <div className="flex gap-4">
            <button
              onClick={() => handlePublish(false)}
              disabled={publishLoading}
              className="btn-light transition-all duration-300 hover:bg-black hover:text-white hover:scale-105 active:scale-95"
            >
              Save Draft
            </button>

            <button
              onClick={() => handlePublish(true)}
              disabled={publishLoading}
              className="btn-dark transition-all duration-300 hover:bg-purple-600 hover:scale-105 active:scale-95"
            >
              {publishLoading
                ? "Processing..."
                : postId
                  ? "Update Post"
                  : "Publish"}
            </button>
          </div>
        </div>

        <AIWorkspaceModal
          open={showAIWorkspace}
          onClose={() => setShowAIWorkspace(false)}
          loading={polishLoading}
          onPolish={() => {
            console.log("STEP 1 - Button clicked");

            runPolish(
              {
                title,
                tags,
                content,
              },
              postId,
            );

            setShowAIWorkspace(false);
          }}
          onAssets={() => {}}
        />
        
        <PolishPreviewModal
          open={showPreview}
          review={review}
          titleSuggestion={titleSuggestion}
          headingSuggestions={headingSuggestions}
          tagSuggestions={tagSuggestions}
          paragraphSuggestions={paragraphSuggestions}
          content={content}
          setContent={setContent}
          editorRef={editorRef}
          setTitle={setTitle}
          setTags={setTags}
          onClose={() => setShowPreview(false)}
        />
      </div>
    </section>
  );
};

export default WritePage;
