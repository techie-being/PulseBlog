import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard.component";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const HomePage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [fetching, setFetching] = useState(false);

    const fetchPosts = async (pageNum = 1) => {
        try {
            pageNum === 1 ? setLoading(true) : setFetching(true);
            
            // Calling your backend route
            const { data } = await axiosInstance.get(`/posts/get-all-posts?page=${pageNum}&limit=10`);
            
            // Your backend sends: { status: 200, data: { data: [...], pagination: {...} }, message: "..." }
            // Extract the result payload (which contains the array and pagination)
            const resultPayload = data.data; 

            if (resultPayload) {
                const newPosts = resultPayload.data || [];
                const pagination = resultPayload.pagination || {};

                setPosts((prev) => (pageNum === 1 ? newPosts : [...prev, ...newPosts]));
                setHasMore(pagination.hasNextPage || false);
            }
        } catch (err) {
            console.error("Home Feed Error:", err);
            toast.error(err.response?.data?.message || "Failed to load the feed");
        } finally {
            setLoading(false);
            setFetching(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchPosts(1);
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage);
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto py-10">
                <p className="text-center animate-pulse">Curating your smart feed...</p>
            </div>
        );
    }

    return (
        <section className="h-cover flex justify-center gap-10">
            <Toaster />
            <div className="w-full max-w-3xl">
                {posts.length === 0 ? (
                    <div className="text-center py-24 text-dark-grey">
                        <i className="fi fi-rr-document text-5xl block mb-4" />
                        <p className="text-xl mb-6">No published posts found!</p>
                        <Link to="/write" className="btn-dark py-2 px-6">Start Writing</Link>
                    </div>
                ) : (
                    <>
                        {posts.map((post, index) => (
                            <PostCard key={post._id} post={post} index={index} />
                        ))}

                        {hasMore && (
                            <button
                                className="btn-light mt-8 mb-20 py-2 px-6 mx-auto block hover:bg-grey/30"
                                onClick={loadMore}
                                disabled={fetching}
                            >
                                {fetching ? "Loading..." : "Load More"}
                            </button>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default HomePage;