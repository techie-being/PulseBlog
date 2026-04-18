import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard.component";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const HomePage = () => {
    const [posts, setPosts]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [page, setPage]         = useState(1);
    const [hasMore, setHasMore]   = useState(false);
    const [fetching, setFetching] = useState(false);

const fetchPosts = async (pageNum = 1) => {
  try {
    pageNum === 1 ? setLoading(true) : setFetching(true);
    const res = await axiosInstance.get(`/posts/get-all-posts?page=${pageNum}&limit=10`);
    
    // FIX: was res.data.data — needs one more level
    const responseData = res.data.data || res.data.result; // handles both response shapes
    const posts = responseData?.data || [];
    const pagination = responseData?.pagination || {};
    
    setPosts((prev) => pageNum === 1 ? posts : [...prev, ...posts]);
    setHasMore(pagination.hasNextPage || false);
  } catch {
    toast.error("Could not load posts. Is the server running?");
  } finally {
    setLoading(false);
    setFetching(false);
  }
};

    useEffect(() => { fetchPosts(1); }, []);

    const loadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchPosts(next);
    };

    if (loading) {
        return (
            <section>
                <Toaster />
                <div className="max-w-3xl mx-auto">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-6 py-8 border-b border-grey animate-pulse">
                            <div className="flex-1 space-y-4">
                                <div className="flex gap-2 items-center">
                                    <div className="w-6 h-6 rounded-full bg-grey" />
                                    <div className="h-3 w-24 bg-grey rounded" />
                                </div>
                                <div className="h-5 w-3/4 bg-grey rounded" />
                                <div className="h-4 w-1/2 bg-grey rounded" />
                            </div>
                            <div className="w-28 h-28 rounded-xl bg-grey hidden sm:block" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section>
            <Toaster />
            <div className="max-w-3xl mx-auto">
                {posts.length === 0 ? (
                    <div className="text-center py-24 text-dark-grey">
                        <i className="fi fi-rr-document text-5xl block mb-4" />
                        <p className="text-xl mb-6">No posts yet!</p>
                        <Link to="/write" className="btn-dark py-2 px-6">Write the first one</Link>
                    </div>
                ) : (
                    <>
                        {posts.map((post, index) => (
                            <PostCard key={post._id} post={post} index={index} />
                        ))}
                        {hasMore && (
                            <div className="text-center py-10">
                                <button
                                    onClick={loadMore}
                                    disabled={fetching}
                                    className="btn-light py-2 px-8 disabled:opacity-50"
                                >
                                    {fetching ? "Loading..." : "Load More"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default HomePage;