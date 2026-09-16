import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard.component";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(urlQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Synchronize search state with URL query parameter changes
  useEffect(() => {
    if (urlQuery.trim()) {
      setQuery(urlQuery);
      fetchSearchResults(urlQuery);
    } else {
      setResults([]);
      setSearched(false);
      setQuery("");
    }
  }, [urlQuery]);

  const fetchSearchResults = async (searchKeyword) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await axiosInstance.get(
        `/posts/search-post?query=${encodeURIComponent(searchKeyword)}&limit=10`
      );

      const rawData = res.data?.data;
      const postsArray = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setResults(postsArray);
    } catch (err) {
      console.error("Search API error:", err);
      toast.error(err?.response?.data?.message || "Search failed. Try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return toast.error("Enter a search term");
    }

    setSearchParams({ q: trimmedQuery });
  };

  // Clear query and reset page state cleanly
  const handleClearSearch = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    setSearchParams({});
    navigate("/"); // Redirect back to feed/home when search is cleared
  };

  return (
    <section className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <Toaster position="top-center" />

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-10">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts by topic or keyword..."
            className="w-full bg-grey/40 dark:bg-gray-800 p-4 pl-12 pr-10 rounded-full text-sm placeholder:text-dark-grey outline-none border border-transparent focus:border-black dark:focus:border-white transition-all text-gray-900 dark:text-white"
          />
          <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-dark-grey text-lg" />
          
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-grey hover:text-black dark:hover:text-white transition-colors"
              aria-label="Clear Search"
            >
              <i className="fi fi-rr-cross-small text-xl" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="bg-black text-white dark:bg-white dark:text-black px-6 sm:px-8 py-3 rounded-full text-sm font-medium active:scale-95 transition-transform shrink-0"
        >
          Search
        </button>
      </form>

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-grey/50 dark:bg-gray-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Initial Prompt State (When no search query is active) */}
      {!loading && !searched && !urlQuery && (
        <div className="text-center py-16 bg-grey/20 dark:bg-gray-900 rounded-2xl border border-grey/60 px-4">
          <i className="fi fi-rr-search text-5xl text-dark-grey block mb-3 opacity-40" />
          <p className="text-base font-medium text-gray-800 dark:text-gray-200">
            Type a query above to start searching
          </p>
          <p className="text-xs text-dark-grey mt-1">
            Explore articles, tags, and topics across PulseBlog.
          </p>
        </div>
      )}

      {/* Empty Search Results State */}
      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16 bg-grey/20 dark:bg-gray-900 rounded-2xl border border-grey/60 px-4">
          <i className="fi fi-rr-search-alt text-5xl text-dark-grey block mb-3 opacity-60" />
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
            No results found for "{urlQuery}"
          </p>
          <p className="text-xs text-dark-grey mt-1">
            Try checking for typos or searching with different keywords.
          </p>
        </div>
      )}

      {/* Results Header */}
      {!loading && searched && results.length > 0 && (
        <p className="text-xs font-semibold text-dark-grey uppercase tracking-wider mb-6">
          Showing {results.length} result{results.length > 1 ? "s" : ""} for "{urlQuery}"
        </p>
      )}

      {/* Results Feed */}
      {!loading && searched && results.length > 0 && (
        <div className="space-y-6">
          {results.map((post, index) => (
            <PostCard key={post._id || index} post={post} index={index} />
          ))}
        </div>
      )}
    </section>
  );
};

export default SearchPage;