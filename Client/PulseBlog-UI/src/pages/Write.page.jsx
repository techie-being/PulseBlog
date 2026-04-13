import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import EditorComponent from "../components/Editor.component";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const WritePage = () => {
    const navigate = useNavigate();
    const { isLoggedIn } = useSelector((state) => state.auth);

    const [title, setTitle]                   = useState("");
    const [content, setContent]               = useState(null);      
    const [thumbnail, setThumbnail]           = useState(null);      
    const [thumbnailPreview, setThumbnailPreview] = useState("");    
    const [tags, setTags]                     = useState("");
    const [loading, setLoading]               = useState(false);

    const fileRef = useRef(null);

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

    const handlePublish = async (isPublished) => {
        if (!title.trim()) return toast.error("Title is required");
        if (!thumbnail)    return toast.error("Thumbnail image is required");
        if (!content)      return toast.error("Write something first!");

        setLoading(true);
        try {
            const form = new FormData();
            form.append("title", title);
            form.append("content", JSON.stringify(content)); // EditorJS JSON → string
            form.append("mediaImage", thumbnail);            // field name must match Multer config
            form.append("isPublished", isPublished);
            form.append("tags", tags);

            await axiosInstance.post("/posts/create-post", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success(isPublished ? "Post published!" : "Draft saved!");
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <Toaster />
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-inter font-bold">New Post</h1>
                </div>

                <div
                    className="w-full aspect-video bg-grey rounded-xl mb-6 cursor-pointer overflow-hidden flex items-center justify-center"
                    onClick={() => fileRef.current.click()}
                >
                    {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="thumbnail" className="w-full h-full object-cover" />
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

                <input
                    type="text"
                    placeholder="Post Title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-4xl font-gelasio font-bold outline-none bg-transparent placeholder:text-grey border-b border-grey pb-4 mb-8"
                />

                <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="input-box mb-6"
                />

                <EditorComponent onChange={setContent} />

                <div className="flex gap-3 justify-end mt-8">
                    <button
                        onClick={() => handlePublish(false)}
                        disabled={loading}
                        className="btn-light py-2 px-5 disabled:opacity-50"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={() => handlePublish(true)}
                        disabled={loading}
                        className="btn-dark py-2 px-5 disabled:opacity-50"
                    >
                        {loading ? "Publishing..." : "Publish"}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default WritePage;