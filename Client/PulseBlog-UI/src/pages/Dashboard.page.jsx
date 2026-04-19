import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";

const DashboardPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, isLoggedIn } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchMyPosts = async () => {
        if (!user?._id) return;
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/posts/get-post-by-author/${user._id}`);
            // FIX: was res.data.data — actual shape is res.data.data.data
            setPosts(res.data.data?.data || []);
        } catch (err) {
            toast.error("Failed to fetch your posts");
        } finally {
            setLoading(false);
        }
        };


        if (isLoggedIn) {
            fetchMyPosts();
        }
    }, [user, isLoggedIn]);

    const handleDelete = async (postId) => {
        // Double-check before deleting
        if (!window.confirm("Are you sure you want to delete this post? This cannot be undone.")) return;

        try {
            await axiosInstance.delete(`/posts/delete-post/${postId}`);
            // Remove the deleted post from the screen immediately
            setPosts((prev) => prev.filter((post) => post._id !== postId));
            toast.success("Post deleted successfully");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete post");
        }
    };

    const handleToggleStatus = async (postId, currentStatus) => {
        try {
            await axiosInstance.patch(`/posts/post-toggle-status/${postId}`);
            
            // Update the post status locally so the UI updates instantly
            setPosts((prev) => 
                prev.map((post) => 
                    post._id === postId ? { ...post, isPublished: !currentStatus } : post
                )
            );
            toast.success(`Post moved to ${!currentStatus ? 'Published' : 'Drafts'}`);
        } catch (err) {
            toast.error("Failed to update post status");
        }
    };

    if (!isLoggedIn) {
        return <Navigate to="/signin" replace />;
    }

    return (
        <section>
            <Toaster />
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-inter font-bold mb-8 text-center md:text-left">
                    My Dashboard
                </h1>

                {loading ? (
                    <div className="space-y-6 animate-pulse">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 w-full bg-grey rounded-xl" />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-24 text-dark-grey bg-grey rounded-xl">
                        <i className="fi fi-rr-document text-5xl block mb-4" />
                        <p className="text-xl mb-6">You haven't written any posts yet.</p>
                        <Link to="/write" className="btn-dark py-2 px-6">Start Writing</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <div key={post._id} className="flex flex-col md:flex-row gap-6 p-4 border border-grey rounded-xl hover:bg-grey/50 transition">
                                <img 
                                    src={post.mediaImage} 
                                    alt="thumbnail" 
                                    className="w-full md:w-40 h-28 object-cover rounded-lg"
                                />
                                
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold font-gelasio line-clamp-1">{post.title}</h2>
                                        <p className="text-sm text-dark-grey mt-1">
                                            {new Date(post.createdAt).toLocaleDateString()} · {post.views || 0} views
                                        </p>
                                        <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${post.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {post.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </div>

                                    <div className="flex gap-4 mt-4 md:mt-0">
                                        <Link 
                                            to={`/post/${post._id}`} 
                                            className="text-sm font-medium hover:underline text-dark-grey"
                                        >
                                            View
                                        </Link>

                                        {/* ADDED: Edit Button */}
                                        <Link 
                                            to={`/edit/${post._id}`} 
                                            className="text-sm font-medium hover:underline text-dark-grey"
                                        >
                                            Edit
                                        </Link>
                                        
                                        <button 
                                            onClick={() => handleToggleStatus(post._id, post.isPublished)}
                                            className="text-sm font-medium hover:underline text-blue-500"
                                        >
                                            {post.isPublished ? "Unpublish" : "Publish"}
                                        </button>

                                        <button 
                                            onClick={() => handleDelete(post._id)}
                                            className="text-sm font-medium hover:underline text-red-500 ml-auto md:ml-0"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default DashboardPage;