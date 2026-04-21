import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import EditorComponent from "../components/Editor.component";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const WritePage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null); 
  const { isLoggedIn } = useSelector((state) => state.auth);

  // --- STATE ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- AI ASSISTANT STATE ---
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [activeAiTab, setActiveAiTab] = useState("polish"); 
  const [aiWorking, setAiWorking] = useState(false);
  const [aiData, setAiData] = useState({
    polish: null,
    summary: null,
    assets: null,
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axiosInstance.get(`/posts/get-post/${postId}`);
        const responseData = res.data?.data || res.data;
        const post = responseData.post || responseData;

        setTitle(post.title || "");
        setTags(Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "");
        setThumbnailPreview(post.mediaImage || "");

        const parsedContent = typeof post.content === "string" 
            ? JSON.parse(post.content) 
            : post.content;
        setContent(parsedContent);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to fetch post details");
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

  const handlePolishTitle = async () => {
    if (!title.trim()) return toast.error("Enter a title first!");
    setIsAiLoading(true);
    try {
      const res = await axiosInstance.post(`/ai/simplify`, {
        selectedText: title, // Matches your backend implementation
      });
      const result = res.data?.data?.simplified_explanation;
      if (result) {
        setTitle(result);
        toast.success("Title polished by AI! ✨");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "AI unavailable");
    } finally {
      setIsAiLoading(false);
    }
  };

  const extractTextFromEditor = () => {
    if (!content || !content.blocks) return "";
    return content.blocks
      .map((block) => {
        if (block.type === "paragraph" || block.type === "header") return block.data.text || "";
        if (block.type === "list") return (block.data.items || []).join(". ");
        return "";
      })
      .join("\n")
      .replace(/<[^>]*>?/gm, ""); 
  };

  const runAiFeature = async (feature) => {
    const plainText = extractTextFromEditor();
    if (!plainText || plainText.length < 50) return toast.error("Please write more content first!");

    setAiWorking(true);
    try {
      let res;
      if (feature === "polish") {
        res = await axiosInstance.post("/ai/polished-draft", { draftContent: plainText });
        setAiData((prev) => ({ ...prev, polish: res.data.data }));
      } else if (feature === "summary") {
        res = await axiosInstance.post("/ai/ai-summary", { content: plainText });
        setAiData((prev) => ({ ...prev, summary: res.data.data }));
      } else if (feature === "assets") {
        res = await axiosInstance.post("/ai/asset-generator", { content: plainText });
        setAiData((prev) => ({ ...prev, assets: res.data.data }));
      }
      toast.success(`${feature} generated!`);
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to run ${feature}`);
    } finally {
      setAiWorking(false);
    }
  };

  const handlePublish = async (isPublished) => {
    if (!title.trim()) return toast.error("Title is required");
    if (!content) return toast.error("Write something first!");
    if (!postId && !thumbnail) return toast.error("Thumbnail image is required");

    setLoading(true);
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
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-dark-grey text-xl animate-pulse">Loading editor...</p>
      </div>
    );
  }

  return (
    <section>
      <Toaster />

      {/* AI MODAL */}
      {showAiAssistant && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative">
            <div className="p-6 border-b border-grey flex justify-between items-center bg-purple/5">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <i className="fi fi-rr-magic-wand text-purple"></i> AI Co-Pilot
              </h2>
              <button onClick={() => setShowAiAssistant(false)} className="hover:text-red transition">
                <i className="fi fi-rr-cross-small text-2xl"></i>
              </button>
            </div>

            <div className="flex px-6 border-b border-grey">
              {['polish', 'summary', 'assets'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveAiTab(tab)}
                  className={`py-4 px-6 capitalize ${activeAiTab === tab ? "border-b-2 border-purple text-purple" : "text-dark-grey"}`}
                >
                  {tab === 'assets' ? 'Social Assets' : tab}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <button onClick={() => runAiFeature(activeAiTab)} disabled={aiWorking} className="btn-dark mb-8">
                {aiWorking ? "Generating..." : `Generate ${activeAiTab}`}
              </button>

              {activeAiTab === "polish" && aiData.polish && (
                <div className="space-y-4">
                  {aiData.polish.suggestions?.map((item, i) => (
                    <div key={i} className="bg-grey/30 p-4 rounded-lg border border-grey">
                      <p className="text-red-500 line-through text-sm">Original: {item.original_sentence}</p>
                      <p className="text-green-600 font-medium">Improved: {item.improved_sentence}</p>
                      <p className="text-xs text-dark-grey mt-2 italic">{item.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeAiTab === "summary" && aiData.summary && (
                <div className="space-y-4">
                  <p className="bg-grey/30 p-4 rounded-lg border border-grey">{aiData.summary.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {aiData.summary.headings?.map((h, i) => <span key={i} className="tag">{h}</span>)}
                  </div>
                </div>
              )}

              {activeAiTab === "assets" && aiData.assets && (
                <div className="space-y-6">
                  <div className="bg-grey/30 p-4 rounded-lg">
                    <h4 className="font-bold text-[#1DA1F2] mb-2">Twitter Thread</h4>
                    {aiData.assets.twitter_thread?.map((t, i) => <p key={i} className="mb-2 text-sm">{i+1}/ {t}</p>)}
                  </div>
                  <div className="bg-grey/30 p-4 rounded-lg">
                    <h4 className="font-bold text-[#0A66C2] mb-2">LinkedIn Post</h4>
                    <p className="text-sm whitespace-pre-wrap">{aiData.assets.linkedin_post}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">{postId ? "Edit Post" : "New Post"}</h1>

        <div className="w-full aspect-video bg-grey rounded-xl mb-6 cursor-pointer overflow-hidden relative group" onClick={() => fileRef.current.click()}>
          {thumbnailPreview ? (
            <img src={thumbnailPreview} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-dark-grey p-10">
              <i className="fi fi-rr-picture text-4xl block mb-2" />
              <p>Add Thumbnail (Max 100KB)</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />

        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Post Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold outline-none border-b border-grey pb-4 pr-[140px]"
          />
          <button onClick={handlePolishTitle} disabled={isAiLoading || !title.trim()} className="absolute right-0 bottom-4 btn-light py-2 px-4 text-sm rounded-full">
            {isAiLoading ? "Polishing..." : "AI Polish ✨"}
          </button>
        </div>

        <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} className="input-box mb-6" />

        <EditorComponent initialContent={content} onChange={setContent} />

        <div className="flex gap-3 justify-end mt-8 border-t border-grey pt-6">
          <button onClick={() => setShowAiAssistant(true)} className="btn-light text-purple mr-auto">
            <i className="fi fi-rr-magic-wand"></i> AI Co-Pilot
          </button>
          <button onClick={() => handlePublish(false)} disabled={loading} className="btn-light">
            {postId ? "Save Draft" : "Save Draft"}
          </button>
          <button onClick={() => handlePublish(true)} disabled={loading} className="btn-dark">
            {loading ? "Processing..." : (postId ? "Update Post" : "Publish")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default WritePage;