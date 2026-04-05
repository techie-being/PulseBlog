import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import BlockRenderer from "../components/BlockRenderer.component";
import PostCard from "../components/PostCard.component";

const PostDetail = () => {
    const { postId } = useParams();
    const [post, setPost]           = useState(null);
    const [related, setRelated]     = useState([]);
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchPost = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get(`/posts/get-post/${postId}`);
                setPost(res.data.data.post);
                setRelated(res.data.data.relatedPosts || []);
                // view count increment
                axiosInstance.get(`/posts/views/${postId}`).catch(() => {});
            } catch {
                // handle 404 
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId]);  

    if (loading) {
        return (
            <section className="max-w-3xl mx-auto animate-pulse space-y-6 py-8">
                <div className="w-full aspect-video bg-grey rounded-xl" />
                <div className="h-8 w-3/4 bg-grey rounded" />
                <div className="h-4 w-1/2 bg-grey rounded" />
            </section>
        );
    }

    if (!post) {
        return (
            <section className="text-center py-24">
                <p className="text-xl text-dark-grey">Post not found.</p>
                <Link to="/" className="btn-dark mt-6 inline-block">Go Home</Link>
            </section>
        );
    }

    let blocks = [];
    try {
        const parsed = JSON.parse(post.content);
        blocks = parsed.blocks || [];
    } catch {
        blocks = [];
    }

    return (
        <section>
            <div className="max-w-3xl mx-auto">
                <img
                    src={post.mediaImage}
                    alt={post.title}
                    className="w-full aspect-video object-cover rounded-xl mb-8"
                />

                <h1 className="font-inter text-4xl font-bold mb-4 leading-snug">
                    {post.title}
                </h1>

                <div className="flex items-center gap-3 mb-8">
                    <img
                        src={post.owner?.avatar}
                        alt={post.owner?.username}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <p className="font-medium capitalize">{post.owner?.username}</p>
                        <p className="text-sm text-dark-grey">
                            {new Date(post.createdAt).toLocaleDateString("en-US", {
                                year: "numeric", month: "long", day: "numeric",
                            })}
                            {" · "}
                            {post.views} views
                        </p>
                    </div>
                </div>

                <BlockRenderer blocks={blocks} />

                {post.tags?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-10 pt-6 border-t border-grey">
                        {post.tags.map((tag) => (
                            <span key={tag} className="tag">{tag}</span>
                        ))}
                    </div>
                )}

                {related.length > 0 && (
                    <div className="mt-12">
                        <h3 className="font-inter text-xl font-bold mb-4">Related Posts</h3>
                        {related.map((p, i) => (
                            <PostCard key={p._id} post={p} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default PostDetail;