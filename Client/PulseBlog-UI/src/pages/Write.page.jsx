import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import EditorComponent from "../components/editorcomponent";
import axiosInstance from "../api/axiosInstance";

const WritePage = () => {
    const [title, setTitle]                   = useState("");
    const [content, setContent]               = useState(null);
    const [thumbnail, setThumbnail]           = useState(null);
    const [thumbnailPreview, setPreview]       = useState(null);
    const [tags, setTags]                     = useState("");
    const [loading, setLoading]               = useState(false);
    const fileRef                             = useRef(null);
    const navigate                            = useNavigate();
//thumbnail 
    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        //  limit is 100KB
        if (file.size > 100 * 1024) {
            toast.error("Thumbnail must be under 100KB");
            return;
        }
        setThumbnail(file);
        setPreview(URL.createObjectURL(file));
    };

    const validateAndSubmit = async (publishStatus) => {
        if (!title.trim())    return toast.error("Title is required");
        if (!content || !content.blocks?.length)
                              return toast.error("Content cannot be empty");
        if (!thumbnail)       return toast.error("Thumbnail image is required");

        setLoading(true);

        const tagsArray = tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const formData = new FormData();
        formData.append("title",       title);
        formData.append("content",     JSON.stringify(content));  // JSON string
        formData.append("tags",        JSON.stringify(tagsArray));
        formData.append("isPublished", publishStatus);
        formData.append("mediaImage",  thumbnail);                // Field name must match backend multer config

        try {
            await axiosInstance.post("/posts/create-post", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success(publishStatus ? "Post published!" : "Draft saved!");
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="max-w-4xl mx-auto">
            <Toaster />

            {/*Thumbnail Upload */}
            <div
                onClick={() => fileRef.current.click()}
                className="w-full h-56 bg-grey rounded-2xl mb-8 flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-dark-grey hover:border-black transition relative"
            >
                {thumbnailPreview ? (
                    <img
                        src={thumbnailPreview}
                        alt="thumbnail preview"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <>
                        <i className="fi fi-rr-picture text-4xl text-dark-grey mb-2" />
                        <p className="text-dark-grey text-sm">
                            Click to upload thumbnail (max 100KB, images only)
                        </p>
                    </>
                )}
                {thumbnailPreview && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <p className="text-white text-sm">Click to change</p>
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

            {/*Title */}
            <textarea
                className="w-full text-4xl font-bold font-gelasio resize-none outline-none bg-transparent placeholder:text-grey mb-4 leading-tight"
                placeholder="Blog title..."
                value={title}
                rows={2}
                onChange={(e) => {
                    // Auto resize
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                    setTitle(e.target.value);
                }}
            />

            {/* Tags */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Add tags, separated by commas (e.g. react, webdev, tips)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="input-box pl-4"
                />
            </div>

            {/*Divider*/}
            <hr className="border-grey mb-6" />

            {/*Editor*/}
            <EditorComponent onChange={setContent} />

            {/*Actions*/}
            <div className="flex gap-4 mt-10 mb-4">
                <button
                    onClick={() => validateAndSubmit(false)}
                    disabled={loading}
                    className="btn-light py-2 px-6 disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save Draft"}
                </button>
                <button
                    onClick={() => validateAndSubmit(true)}
                    disabled={loading}
                    className="btn-dark py-2 px-6 disabled:opacity-50"
                >
                    {loading ? "Publishing..." : "Publish"}
                </button>
            </div>
        </section>
    );
};

export default WritePage;