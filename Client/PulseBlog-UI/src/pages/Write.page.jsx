import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import EditorComponent from "../components/Editor.component";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const WritePage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);

  const fileRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const [isFetching, setIsFetching] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- NEW AI ASSISTANT STATE ---
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [activeAiTab, setActiveAiTab] = useState("polish"); // 'polish', 'summary', 'assets'
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
        setTags(post.tags || "");
        setThumbnailPreview(post.mediaImage || "");

        const parsedContent =
          typeof post.content === "string"
            ? JSON.parse(post.content)
            : post.content;
        setContent(parsedContent);
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
    }
  }, [postId, isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      return toast.error("Image must be under 100KB");
    }

    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handlePolishTitle = async () => {
    if (!title.trim()) return toast.error("Enter a title first!");

    setIsAiLoading(true);
    try {
      const res = await axiosInstance.post(`/ai/simplify`, {
        selectedText: title,
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

  // --- HELPER: EXTRACT TEXT FROM EDITORJS JSON ---
  const extractTextFromEditor = () => {
    if (!content) return "";
    const blocks = content.blocks || content;
    if (!Array.isArray(blocks)) return "";

    return blocks
      .map((block) => {
        if (block.type === "paragraph" || block.type === "header") return block.data.text || "";
        if (block.type === "list") return (block.data.items || []).join(". ");
        return "";
      })
      .join("\n")
      .replace(/<[^>]*>?/gm, ""); // Strips HTML tags EditorJS leaves behind like <b>
  };

  // --- NEW AI ASSISTANT FUNCTION ---
  const runAiFeature = async (feature) => {
    const plainText = extractTextFromEditor();
    
    if (!plainText || plainText.length < 50) {
      return toast.error("Please write a bit more content first!");
    }

    setAiWorking(true);
    try {
      let res;
      if (feature === "polish") {
        // Backend expects `draftContent` for Polish
        res = await axiosInstance.post("/ai/polished-draft", { draftContent: plainText });
        setAiData((prev) => ({ ...prev, polish: res.data.data }));
      } else if (feature === "summary") {
        // Backend expects `content` for Summary
        res = await axiosInstance.post("/ai/ai-summary", { content: plainText });
        setAiData((prev) => ({ ...prev, summary: res.data.data }));
      } else if (feature === "assets") {
        // Backend expects `content` for Assets
        res = await axiosInstance.post("/ai/asset-generator", { content: plainText });
        setAiData((prev) => ({ ...prev, assets: res.data.data }));
      }
      toast.success(`${feature} generated successfully!`);
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to run ${feature}`);
    } finally {
      setAiWorking(false);
    }
  };

  const handlePublish = async (isPublished) => {
    if (!title.trim()) return toast.error("Title is required");
    if (!content) return toast.error("Write something first!");

    if (!postId && !thumbnail)
      return toast.error("Thumbnail image is required");

    setLoading(true);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("content", JSON.stringify(content));

      if (thumbnail) {
        form.append("mediaImage", thumbnail);
      }

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

      {/* --- AI ASSISTANT MODAL START --- */}
      {showAiAssistant && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-grey flex justify-between items-center bg-purple/5 rounded-t-xl">
              <h2 className="text-2xl font-bold font-gelasio flex items-center gap-2">
                <i className="fi fi-rr-magic-wand text-purple"></i> AI Co-Pilot
              </h2>
              <button onClick={() => setShowAiAssistant(false)} className="text-2xl hover:text-red transition">
                <i className="fi fi-rr-cross-small"></i>
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex px-6 border-b border-grey">
              {['polish', 'summary', 'assets'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveAiTab(tab)}
                  className={`py-4 px-6 capitalize font-medium ${
                    activeAiTab === tab ? "border-b-2 border-purple text-purple" : "text-dark-grey hover:text-black"
                  }`}
                >
                  {tab === 'assets' ? 'Social Assets' : tab}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              
              <button 
                onClick={() => runAiFeature(activeAiTab)} 
                disabled={aiWorking}
                className="btn-dark mb-8 flex items-center gap-2"
              >
                {aiWorking ? (
                  <span className="animate-pulse">Generating Magic...</span>
                ) : (
                  <>Generate {activeAiTab === 'assets' ? 'Assets' : activeAiTab} <i className="fi fi-rr-sparkles"></i></>
                )}
              </button>

              {/* POLISH TAB */}
              {activeAiTab === "polish" && aiData.polish && (
                <div className="flex flex-col gap-6">
                  {aiData.polish.suggestions?.map((item, i) => (
                    <div key={i} className="bg-grey/30 p-4 rounded-lg border border-grey">
                      <p className="text-red-500 line-through mb-2"><span className="font-bold">Original:</span> {item.original_sentence}</p>
                      <p className="text-green-600 mb-2"><span className="font-bold">Improved:</span> {item.improved_sentence}</p>
                      <p className="text-sm text-dark-grey italic"><i className="fi fi-rr-info"></i> {item.explanation}</p>
                    </div>
                  ))}
                  {aiData.polish.suggestions?.length === 0 && <p>Your draft is already looking great!</p>}
                </div>
              )}

              {/* SUMMARY TAB */}
              {activeAiTab === "summary" && aiData.summary && (
                <div>
                  <h3 className="text-xl font-bold mb-2">Executive Summary</h3>
                  <p className="bg-grey/30 p-4 rounded-lg border border-grey mb-6 leading-relaxed">
                    {aiData.summary.summary}
                  </p>
                  
                  <h3 className="text-xl font-bold mb-2">Suggested Headings</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {aiData.summary.headings?.map((heading, i) => (
                      <li key={i} className="text-dark-grey font-medium">{heading}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ASSETS TAB */}
              {activeAiTab === "assets" && aiData.assets && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-[#1DA1F2]">
                      <i className="fi fi-brands-twitter"></i> Twitter Thread
                    </h3>
                    <div className="bg-grey/30 p-4 rounded-lg space-y-3 border border-grey">
                      {aiData.assets.twitter_thread?.map((tweet, i) => (
                        <p key={i}><strong>{i + 1}/</strong> {tweet}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-[#0A66C2]">
                      <i className="fi fi-brands-linkedin"></i> LinkedIn Post
                    </h3>
                    <div className="bg-grey/30 p-4 rounded-lg border border-grey whitespace-pre-wrap">
                      {aiData.assets.linkedin_post}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-purple">
                      <i className="fi fi-rr-hastag"></i> Viral Hooks
                    </h3>
                    <ul className="list-decimal pl-5 space-y-2">
                      {aiData.assets.viral_hooks?.map((hook, i) => (
                        <li key={i} className="text-dark-grey font-medium">{hook}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {!aiWorking && !aiData[activeAiTab] && (
                <div className="text-center text-dark-grey py-10">
                  <i className="fi fi-rr-magic-wand text-5xl mb-4 block opacity-50"></i>
                  <p>Click the generate button above to let AI analyze your content!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* --- AI ASSISTANT MODAL END --- */}

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-inter font-bold">
            {postId ? "Edit Post" : "New Post"}
          </h1>
        </div>

        <div
          className="w-full aspect-video bg-grey rounded-xl mb-6 cursor-pointer overflow-hidden flex items-center justify-center relative group"
          onClick={() => fileRef.current.click()}
        >
          {thumbnailPreview ? (
            <>
              <img
                src={thumbnailPreview}
                alt="thumbnail"
                className="w-full h-full object-cover group-hover:opacity-80 transition"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30">
                <p className="text-white font-medium">Change Thumbnail</p>
              </div>
            </>
          ) : (
            <div className="text-center text-dark-grey">
              <i className="fi fi-rr-picture text-4xl block mb-2" />
              <p>Click to add thumbnail</p>
              <p className="text-sm mt-1">Max 100KB — Cloudinary upload</p>
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
            className="w-full text-4xl font-gelasio font-bold outline-none bg-transparent placeholder:text-grey border-b border-grey pb-4 pr-[140px]"
          />
          <button
            onClick={handlePolishTitle}
            disabled={isAiLoading || !title.trim()}
            className="absolute right-0 bottom-4 text-sm btn-light py-2 px-4 disabled:opacity-50 flex items-center gap-2 rounded-full transition-all"
          >
            <i className="fi fi-rr-magic-wand text-purple"></i>
            {isAiLoading ? "Polishing..." : "AI Polish"}
          </button>
        </div>

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="input-box mb-6"
        />

        <EditorComponent initialContent={content} onChange={setContent} />

        {/* --- ADDED AI CO-PILOT BUTTON TO ACTION BAR --- */}
        <div className="flex gap-3 justify-end mt-8 border-t border-grey pt-6">
          <button
            onClick={() => setShowAiAssistant(true)}
            className="btn-light flex items-center gap-2 text-purple hover:bg-purple/10 mr-auto border border-purple/20"
          >
            <i className="fi fi-rr-magic-wand"></i> Open AI Co-Pilot
          </button>
          
          <button
            onClick={() => handlePublish(false)}
            disabled={loading}
            className="btn-light py-2 px-5 disabled:opacity-50"
          >
            {postId ? "Save as Draft" : "Save Draft"}
          </button>
          <button
            onClick={() => handlePublish(true)}
            disabled={loading}
            className="btn-dark py-2 px-5 disabled:opacity-50"
          >
            {loading
              ? postId
                ? "Updating..."
                : "Publishing..."
              : postId
              ? "Publish Updates"
              : "Publish"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default WritePage;