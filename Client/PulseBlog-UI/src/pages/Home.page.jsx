import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard.component";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const CATEGORIES = [
  "All",
  "Technology",
  "Programming",
  "AI",
  "Business",
  "Productivity",
];

const HomePage = () => {
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch Main Feed Posts
  const fetchPosts = async (pageNum = 1, category = activeCategory) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setFetching(true);
      }

      const categoryParam =
        category !== "All" ? `&category=${encodeURIComponent(category)}` : "";
      const response = await axiosInstance.get(
        `/posts/get-all-posts?page=${pageNum}&limit=5${categoryParam}`,
      );

      const resultPayload = response.data?.data;

      if (resultPayload) {
        const newPosts = resultPayload.data || resultPayload.docs || [];
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

  useEffect(() => {
    fetchPosts(1, activeCategory);
  }, []);

  const handleCategoryChange = (category) => {
    if (category === activeCategory) return;
    setActiveCategory(category);
    setPage(1);
    fetchPosts(1, category);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, activeCategory);
  };

  return (
    <section className="h-cover flex justify-center gap-10 px-4 md:px-8 max-w-7xl mx-auto py-8">
      

      {/* Main Feed Column */}
      <div className="w-full max-w-3xl">
        {/* Category Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar border-b border-grey">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors shrink-0 ${
  activeCategory === cat
    ? "bg-indigo-600 text-white dark:bg-indigo-500"
    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex flex-col gap-3 p-4 border border-grey/60 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-grey/60" />
                  <div className="h-4 w-32 bg-grey/60 rounded" />
                </div>
                <div className="h-6 w-3/4 bg-grey/60 rounded" />
                <div className="h-4 w-full bg-grey/60 rounded" />
                <div className="h-32 w-full bg-grey/60 rounded-xl" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 text-dark-grey bg-grey/30 border border-grey rounded-2xl">
            <i className="fi fi-rr-document text-5xl block mb-4 opacity-60" />
            <p className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
              No published posts found in {activeCategory}
            </p>
            <p className="text-xs text-dark-grey mb-6">
              Be the first author to write a story on this topic!
            </p>
            <Link
              to="/write"
              className="btn-dark py-2 px-6 rounded-full inline-block text-sm"
            >
              Start Writing
            </Link>
          </div>
        ) : (
          /* Main Feed */
          <>
            {posts.map((post, index) => (
              <PostCard key={post._id} post={post} index={index} />
            ))}

            {hasMore && (
              <button
                className="btn-light mt-8 mb-16 py-2.5 px-8 mx-auto block hover:bg-grey/40 text-sm font-medium rounded-full border border-grey transition-colors"
                onClick={loadMore}
                disabled={fetching}
              >
                {fetching ? (
                  <span className="flex items-center gap-2">
                    <i className="fi fi-rr-spinner animate-spin" /> Loading...
                  </span>
                ) : (
                  "Load More"
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:block w-80 shrink-0 border-l border-grey pl-8 space-y-8 h-fit sticky top-24">
        {/* Topics Filter */}
        <div>
          <h2 className="text-base font-bold font-inter text-gray-900 dark:text-white mb-4">
            Topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.slice(1).map((tag) => (
              <button
                key={tag}
                onClick={() => handleCategoryChange(tag)}
                className="text-xs bg-grey/60 hover:bg-grey px-3 py-1.5 rounded-full text-dark-grey hover:text-black dark:hover:text-white transition-colors"
              >
                #{tag.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
};

export default HomePage;
