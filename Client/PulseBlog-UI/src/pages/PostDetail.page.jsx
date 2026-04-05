import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import BlockRenderer from "../components/BlockRenderer.component";
import toast from "react-hot-toast";

const PostDetail = () => {
    const { postId }           = useParams();
    const [post, setPost]      = useState(null);
    const [related, setRelated]= useState([]);
    const [loading, setLoading]= useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axiosInstance.get(`/posts/get-post/${postId}`);
                setPost(res.data.data.post);
                setRelated(res.data.data.relatedPosts || []);
                // Fire-and-forget view count
                axiosInstance.get(`/posts/views/${postId}`).catch(() => {});
            } catch {
                toast.error("Post not found");
            } finally {
                setLoading(false);
            }
        };
        fetch();
        window.scrollTo(0, 0);
    }, [postId]);

    if (loading) return (
        <section className="max-w-3xl mx-auto animate-pulse">
            <div className="w-full aspect-video bg-grey rounded-2xl mb-8" />
            <div className="h-10 bg-grey rounded w-3/4 mb-4" />
            <div className="flex gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-grey" />
                <div className="space-y-2">
                    <div className="h-4 bg-grey rounded w-24" />
                    <div className="h-3 bg-grey rounded w-20" />
                </div>
            </div>
            {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-grey rounded mb-3" style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
        </section>
    );

    if (!post) return (
        <section className="text-center py-24">
            <p className="text-2xl text-dark-grey mb-4">Post not found</p>
            <Link to="/" className="btn-dark py-2 px-6">Go Home</Link>
        </section>
    );

    // Parse stored JSON string back to EditorJS blocks
    let blocks = [];
    try {
        const parsed = JSON.parse(post.content);
        blocks = parsed.blocks || [];
    } catch {
        blocks = [];
    }

    return (
        <section className="max-w-3xl mx-auto">

            {/* Thumbnail */}
            <img
                src={post.mediaImage}
                alt={post.title}
                className="w-full aspect-video object-cover rounded-2xl mb-10"
            />

            {/* Title */}
            <h1 className="font-bold font-gelasio text-4xl md:text-5xl leading-tight mb-6">
                {post.title}
            </h1>

            {/* Author + Meta */}
            <div className="flex items-center gap-4 mb-10 pb-8 border-b border-grey">
                <Link to={`/profile/${post.owner?.username}`}>
                    <img
                        src={post.owner?.avatar}
                        alt={post.owner?.username}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                </Link>
                <div>
                    <Link
                        to={`/profile/${post.owner?.username}`}
                        className="font-medium hover:underline capitalize"
                    >
                        {post.owner?.username}
                    </Link>
                    <p className="text-dark-grey text-sm">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                            year:  "numeric",
                            month: "long",
                            day:   "numeric",
                        })}
                    </p>
                </div>

                <div className="ml-auto flex gap-4 text-dark-grey text-sm">
                    <span><i className="fi fi-rr-eye mr-1" />{post.views ?? 0}</span>
                    <span><i className="fi fi-rr-heart mr-1" />{post.likeCount ?? 0}</span>
                </div>
            </div>

            {/* Content */}
            <BlockRenderer blocks={blocks} />

            {/* Tags */}
            {post.tags?.length > 0 && (
                <div className="mt-12 pt-8 border-t border-grey flex gap-3 flex-wrap">
                    {post.tags.map((tag, i) => (
                        <span key={i} className="tag">{tag}</span>
                    ))}
                </div>
            )}

            {/* Related Posts */}
            {related.length > 0 && (
                <div className="mt-16">
                    <h3 className="font-bold text-2xl mb-6">Related Posts</h3>
                    <div className="grid gap-4">
                        {related.slice(0, 3).map((r) => (
                            <Link
                                key={r._id}
                                to={`/post/${r._id}`}
                                className="flex gap-4 p-4 bg-grey rounded-xl hover:bg-grey/60 transition"
                            >
                                <img src={r.mediaImage} alt={r.title} className="w-20 h-20 rounded-lg object-cover" />
                                <div>
                                    <p className="font-medium line-clamp-2">{r.title}</p>
                                    <p className="text-dark-grey text-sm mt-1">{r.owner?.username}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default PostDetail;