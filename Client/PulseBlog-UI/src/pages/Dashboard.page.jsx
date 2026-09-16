import { useState, useEffect, useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";

import ConfirmationModal from "../components/ConfirmationModal.component";

const POSTS_PER_PAGE = 5;

const DashboardPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'published' | 'drafts'
  const [currentPage, setCurrentPage] = useState(1);

  const { user, isLoggedIn } = useSelector((state) => state.auth);

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "danger",
    title: "",
    message: "",
    confirmText: "Confirm",
    onConfirm: () => {},
  });

  const openModal = (config) => {
    setModalConfig({ ...config, isOpen: true });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const fetchMyPosts = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/posts/get-post-by-author/${user._id}`);
        setPosts(res.data.data?.data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to fetch your posts");
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchMyPosts();
    }
  }, [user, isLoggedIn]);

  // Analytics Metrics
  const stats = useMemo(() => {
    const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
    const totalLikes = posts.reduce((acc, p) => acc + (p.likeCount || 0), 0);
    const publishedCount = posts.filter((p) => p.isPublished).length;
    const draftCount = posts.length - publishedCount;

    return { totalViews, totalLikes, publishedCount, draftCount, totalPosts: posts.length };
  }, [posts]);

  // Filtered & Search Results
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeTab === "published") return matchesSearch && post.isPublished;
      if (activeTab === "drafts") return matchesSearch && !post.isPublished;
      return matchesSearch;
    });
  }, [posts, searchQuery, activeTab]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  // Reset pagination when search query or filter tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const performDelete = async (postId) => {
    const previousPosts = [...posts];
    setPosts((prev) => prev.filter((post) => post._id !== postId));

    try {
      await axiosInstance.delete(`/posts/delete-post/${postId}`);
      toast.success("Post deleted successfully");
    } catch (err) {
      setPosts(previousPosts);
      toast.error(err?.response?.data?.message || "Failed to delete post");
    }
  };

  const handleDelete = (postId, title) => {
    openModal({
      type: "danger",
      title: "Delete Post?",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: "Delete",
      onConfirm: () => performDelete(postId),
    });
  };

  const performToggleStatus = async (postId, currentStatus) => {
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId ? { ...post, isPublished: !currentStatus } : post
      )
    );

    try {
      await axiosInstance.patch(`/posts/post-toggle-status/${postId}`);
      toast.success(`Post moved to ${!currentStatus ? "Published" : "Drafts"}`);
    } catch (err) {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, isPublished: currentStatus } : post
        )
      );
      toast.error(err?.response?.data?.message || "Failed to update post status");
    }
  };

  const handleToggleStatus = (postId, title, currentStatus) => {
    const action = currentStatus ? "unpublish" : "publish";
    openModal({
      type: currentStatus ? "warning" : "primary",
      title: `${currentStatus ? "Unpublish" : "Publish"} Post?`,
      message: `Are you sure you want to ${action} "${title}"?`,
      confirmText: currentStatus ? "Unpublish" : "Publish",
      onConfirm: () => performToggleStatus(postId, currentStatus),
    });
  };

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <Toaster />

      {/* Header & New Post Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-inter text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-dark-grey mt-1">
            Manage your posts, track performance, and write new content.
          </p>
        </div>
        <Link
          to="/write"
          className="btn-dark flex items-center justify-center gap-2 py-2.5 px-5 rounded-full text-sm font-medium w-fit active:scale-95 transition-transform"
        >
          <i className="fi fi-rr-edit text-base" /> Write New Post
        </Link>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-grey/50 dark:bg-gray-800/40 border border-grey rounded-xl">
          <p className="text-xs text-dark-grey font-medium uppercase tracking-wider">Total Posts</p>
          <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
            {stats.totalPosts}
          </p>
        </div>
        <div className="p-4 bg-grey/50 dark:bg-gray-800/40 border border-grey rounded-xl">
          <p className="text-xs text-dark-grey font-medium uppercase tracking-wider">Published</p>
          <p className="text-xl sm:text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
            {stats.publishedCount}
          </p>
        </div>
        <div className="p-4 bg-grey/50 dark:bg-gray-800/40 border border-grey rounded-xl">
          <p className="text-xs text-dark-grey font-medium uppercase tracking-wider">Total Views</p>
          <p className="text-xl sm:text-2xl font-bold mt-1 text-purple">
            {stats.totalViews}
          </p>
        </div>
        <div className="p-4 bg-grey/50 dark:bg-gray-800/40 border border-grey rounded-xl">
          <p className="text-xs text-dark-grey font-medium uppercase tracking-wider">Total Likes</p>
          <p className="text-xl sm:text-2xl font-bold mt-1 text-red-500">
            {stats.totalLikes}
          </p>
        </div>
      </div>

      {/* Search Bar & Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 border-b border-grey pb-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All", count: stats.totalPosts },
            { id: "published", label: "Published", count: stats.publishedCount },
            { id: "drafts", label: "Drafts", count: stats.draftCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                activeTab === tab.id
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-grey/60 text-dark-grey hover:bg-grey"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full bg-grey/60 dark:bg-gray-800 text-sm py-2 pl-9 pr-4 rounded-full outline-none focus:ring-2 focus:ring-purple/50 transition-all placeholder:text-dark-grey"
          />
          <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-dark-grey text-sm" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-grey hover:text-black dark:hover:text-white"
            >
              <i className="fi fi-rr-cross text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* Posts List Section */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 w-full bg-grey/60 rounded-xl" />
          ))}
        </div>
      ) : paginatedPosts.length === 0 ? (
        <div className="text-center py-16 text-dark-grey bg-grey/30 border border-grey rounded-2xl">
          <i className="fi fi-rr-document text-4xl block mb-3 opacity-60" />
          <p className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            {searchQuery
              ? "No posts match your search query."
              : activeTab !== "all"
              ? `No ${activeTab} posts found.`
              : "You haven't written any posts yet."}
          </p>
          <p className="text-xs text-dark-grey mb-6">
            Share your thoughts with the world.
          </p>
          <Link to="/write" className="btn-dark py-2 px-6 rounded-full text-sm inline-block">
            Start Writing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedPosts.map((post) => (
            <div
              key={post._id}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 border border-grey rounded-2xl hover:border-black/20 dark:hover:border-white/20 transition-all bg-white dark:bg-gray-900 shadow-sm"
            >
              {/* Media Preview */}
              {post.mediaImage ? (
                <img
                  src={post.mediaImage}
                  alt={post.title || "Post thumbnail"}
                  className="w-full sm:w-36 h-36 sm:h-28 object-cover rounded-xl shrink-0"
                />
              ) : (
                <div className="w-full sm:w-36 h-28 bg-grey/60 rounded-xl flex items-center justify-center text-dark-grey shrink-0">
                  <i className="fi fi-rr-picture text-2xl" />
                </div>
              )}

              {/* Main Content Info */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        post.isPublished
                          ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400"
                      }`}
                    >
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="text-xs text-dark-grey">·</span>
                    <p className="text-xs text-dark-grey">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold font-gelasio line-clamp-1 text-gray-900 dark:text-white">
                    {post.title || "Untitled Post"}
                  </h2>

                  <div className="flex items-center gap-4 text-xs text-dark-grey mt-2">
                    <span className="flex items-center gap-1">
                      <i className="fi fi-rr-eye" /> {post.views || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fi fi-rr-heart" /> {post.likeCount || 0} likes
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-grey/60">
                  <Link
                    to={`/post/${post._id}`}
                    className="text-xs font-medium hover:underline text-dark-grey hover:text-black dark:hover:text-white flex items-center gap-1"
                  >
                    <i className="fi fi-rr-eye" /> View
                  </Link>

                  <Link
                    to={`/edit/${post._id}`}
                    className="text-xs font-medium hover:underline text-dark-grey hover:text-black dark:hover:text-white flex items-center gap-1"
                  >
                    <i className="fi fi-rr-edit" /> Edit
                  </Link>

                  <button
                    onClick={() => handleToggleStatus(post._id, post.title, post.isPublished)}
                    className="text-xs font-medium hover:underline text-purple flex items-center gap-1"
                  >
                    <i className={`fi ${post.isPublished ? "fi-rr-cross-circle" : "fi-rr-check-circle"}`} />
                    {post.isPublished ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    onClick={() => handleDelete(post._id, post.title)}
                    className="text-xs font-medium hover:underline text-red-500 ml-auto flex items-center gap-1"
                  >
                    <i className="fi fi-rr-trash" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-grey pt-6 mt-8">
          <p className="text-xs text-dark-grey">
            Showing Page <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-grey text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-grey transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-grey text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-grey transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        type={modalConfig.type}
      />
    </section>
  );
};

export default DashboardPage;