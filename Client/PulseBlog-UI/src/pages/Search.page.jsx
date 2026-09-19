import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import PostCard from "../components/PostCard.component";
import axiosInstance from "../api/axiosInstance";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(urlQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Extract posts from API response
  const extractPosts = (response) => {
    const data = response?.data?.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return [];
  };

  // Fetch search results
  const fetchSearchResults = useCallback(async (searchKeyword) => {
    const trimmedKeyword = searchKeyword.trim();

    // No search query
    if (!trimmedKeyword) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    // Search query must contain at least 2 characters
    if (trimmedKeyword.length < 2) {
      setResults([]);
      setSearched(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      const response = await axiosInstance.get(
        `/posts/search-post?query=${encodeURIComponent(
          trimmedKeyword
        )}&limit=10`
      );

      const posts = extractPosts(response);

      setResults(posts);
    } catch (error) {
      console.error("Search API error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Search failed. Try again."
      );

      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run search whenever URL query changes
  useEffect(() => {
    const trimmedQuery = urlQuery.trim();

    // Search was cleared
    if (!trimmedQuery) {
      setQuery("");
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setQuery(trimmedQuery);

    fetchSearchResults(trimmedQuery);
  }, [urlQuery, fetchSearchResults]);

  // Submit search
  const handleSearch = (event) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      toast.error("Enter a search term");
      return;
    }

    if (trimmedQuery.length < 2) {
      toast.error("Search must contain at least 2 characters");
      return;
    }

    setSearchParams({
      q: trimmedQuery,
    });
  };

  // Clear search
  const handleClearSearch = () => {
    // URL becomes /search
    // useEffect will clear query, results and search state
    setSearchParams({});
  };

  const hasQuery = urlQuery.trim().length > 0;
  const hasResults = results.length > 0;

  return (
    <section className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <Toaster position="top-center" />

      {/* ==================== SEARCH FORM ==================== */}
      <form
        onSubmit={handleSearch}
        className="flex gap-3 mb-10"
        role="search"
      >
        <div className="relative flex-1">
          <label
            htmlFor="search-input"
            className="sr-only"
          >
            Search posts
          </label>

          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search posts by topic or keyword..."
            autoComplete="off"
            aria-label="Search posts"
            className="w-full bg-grey/40 dark:bg-gray-800 p-4 pl-12 pr-10 rounded-full text-sm placeholder:text-dark-grey outline-none border border-transparent focus:border-black dark:focus:border-white transition-all text-gray-900 dark:text-white"
          />

          {/* Search Icon */}
          <i
            className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-dark-grey text-lg"
            aria-hidden="true"
          />

          {/* Custom Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-grey hover:text-black dark:hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <i
                className="fi fi-rr-cross-small text-xl"
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white dark:bg-white dark:text-black px-6 sm:px-8 py-3 rounded-full text-sm font-medium active:scale-95 transition-transform shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* ==================== LOADING STATE ==================== */}
      {loading && (
        <div
          className="space-y-6"
          aria-live="polite"
          aria-busy="true"
        >
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-32 bg-grey/50 dark:bg-gray-800 rounded-2xl animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      {/* ==================== INITIAL STATE ==================== */}
      {!loading && !searched && !hasQuery && (
        <div className="text-center py-16 bg-grey/20 dark:bg-gray-900 rounded-2xl border border-grey/60 px-4">
          <i
            className="fi fi-rr-search text-5xl text-dark-grey block mb-3 opacity-40"
            aria-hidden="true"
          />

          <p className="text-base font-medium text-gray-800 dark:text-gray-200">
            Type a query above to start searching
          </p>

          <p className="text-xs text-dark-grey mt-1">
            Explore articles, tags, and topics across PulseBlog.
          </p>
        </div>
      )}

      {/* ==================== NO RESULTS ==================== */}
      {!loading && searched && !hasResults && hasQuery && (
        <div className="text-center py-16 bg-grey/20 dark:bg-gray-900 rounded-2xl border border-grey/60 px-4">
          <i
            className="fi fi-rr-search-alt text-5xl text-dark-grey block mb-3 opacity-60"
            aria-hidden="true"
          />

          <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
            No results found for "{urlQuery}"
          </p>

          <p className="text-xs text-dark-grey mt-1">
            Try checking for typos or searching with different keywords.
          </p>
        </div>
      )}

      {/* ==================== RESULT COUNT ==================== */}
      {!loading && searched && hasResults && (
        <p
          className="text-xs font-semibold text-dark-grey uppercase tracking-wider mb-6"
          aria-live="polite"
        >
          Showing {results.length} result
          {results.length > 1 ? "s" : ""} for "{urlQuery}"
        </p>
      )}

      {/* ==================== SEARCH RESULTS ==================== */}
      {!loading && searched && hasResults && (
        <div className="space-y-6">
          {results.map((post, index) => (
            <PostCard
              key={post._id || `search-result-${index}`}
              post={post}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default SearchPage;