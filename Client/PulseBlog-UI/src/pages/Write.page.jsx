import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import EditorComponent from "../components/Editor.component";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const WritePage = () => {
    const { postId } = useParams(); // Determines if we are in Edit Mode
    const navigate = useNavigate();
    const { isLoggedIn } = useSelector((state) => state.auth);

    const [title, setTitle]                   = useState("");
    const [content, setContent]               = useState(null);      
    const [thumbnail, setThumbnail]           = useState(null);      
    const [thumbnailPreview, setThumbnailPreview] = useState("");    
    const [tags, setTags]                     = useState("");
    const [loading, setLoading]               = useState(false);
    
    // State for initial data fetching (Edit Mode)
    const [isFetching, setIsFetching]         = useState(true);

    // State for the AI Assistant
    const [isAiLoading, setIsAiLoading]       = useState(false);

    const fileRef = useRef(null);

    // Fetch existing post data if in Edit Mode
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axiosInstance.get(`/posts/get-post/${postId}`);
                const post = res.data?.data || res.data;

                setTitle(post.title || "");
                setTags(Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "");
                setThumbnailPreview(post.mediaImage || "");
                
                // Parse the content if stored as stringified JSON
                const parsedContent = typeof post.content === 'string' 
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
                setIsFetching(false); // Not in edit mode, stop loading instantly
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
            const res = await axiosInstance.get(`/ai/simplify`, { 
                data: { selectedText: title } 
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

    const handlePublish = async (isPublished) => {
        if (!title.trim()) return toast.error("Title is required");
        if (!content)      return toast.error("Write something first!");
        
        // Thumbnail is only strictly required if creating a NEW post
        if (!postId && !thumbnail) return toast.error("Thumbnail image is required");

        setLoading(true);
        try {
            const form = new FormData();
            form.append("title", title);
            form.append("content", JSON.stringify(content)); 
            
            // Only append mediaImage if the user uploaded a new thumbnail
            if (thumbnail) {
                form.append("mediaImage", thumbnail);            
            }
            
            form.append("isPublished", isPublished);
            form.append("tags", tags);

            if (postId) {
                // EDIT MODE -> PATCH
                await axiosInstance.patch(`/posts/update-post/${postId}`, form, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success(isPublished ? "Post updated!" : "Draft updated!");
            } else {
                // CREATE MODE -> POST
                await axiosInstance.post("/posts/create-post", form, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success(isPublished ? "Post published!" : "Draft saved!");
            }

            navigate("/dashboard");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save post");
        } finally {
            setLoading(false);
        }
    };

    // Prevent rendering the editor before old content is fetched, 
    // otherwise the editor might start empty and overwrite the real content.
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
                            <img src={thumbnailPreview} alt="thumbnail" className="w-full h-full object-cover group-hover:opacity-80 transition" />
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

                {/* AI Title Input Section */}
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
                        <i className="fi fi-rr-magic-wand text-purple-500"></i>
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

                {/* NOTE: Make sure EditorComponent accepts `initialContent` prop to pre-fill blocks */}
                <EditorComponent initialContent={content} onChange={setContent} />

                <div className="flex gap-3 justify-end mt-8">
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
                        {loading ? (postId ? "Updating..." : "Publishing...") : (postId ? "Publish Updates" : "Publish")}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default WritePage;