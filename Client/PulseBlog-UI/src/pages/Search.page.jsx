import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Imported useSearchParams
import PostCard from "../components/PostCard.component";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const SearchPage = () => {
    // 1. Grab the query parameters from the URL
    const [searchParams, setSearchParams] = useSearchParams();
    const urlQuery = searchParams.get("q") || ""; // Get the 'q' value, or default to empty string

    // 2. Set the initial state based on the URL
    const [query, setQuery] = useState(urlQuery);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // 3. Automatically fetch data whenever the URL changes
    useEffect(() => {
        if (urlQuery) {
            setQuery(urlQuery);
            fetchSearchResults(urlQuery);
        } else {
            // If the URL is just /search with no query, clear the results
            setResults([]);
            setSearched(false);
            setQuery("");
        }
    }, [urlQuery]); // This runs every time 'urlQuery' changes

    // Extracted the backend call into its own function
    const fetchSearchResults = async (searchKeyword) => {
        setLoading(true);
        setSearched(true);
        try {
            const res = await axiosInstance.get(`/posts/search-post?query=${encodeURIComponent(searchKeyword)}&limit=10`);
            setResults(res.data.data?.data || []);
        } catch {
            toast.error("Search failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return toast.error("Enter a search term");

        // 4. Instead of manually fetching here, we just update the URL.
        // The useEffect above will detect the URL change and automatically run the fetch!
        setSearchParams({ q: query });
    };

    return (
        <section>
            <Toaster />
            <div className="w-full max-w-3xl p-4">
                <form onSubmit={handleSearch} className="flex gap-3 mb-10">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search posts by topic or keyword..."
                            className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey outline-none focus:bg-transparent border border-grey focus:border-black"
                        />
                        <i className="fi fi-br-search absolute left-4 top-1/2 -translate-y-1/2 text-dark-grey" />
                    </div>
                    <button type="submit" className="btn-dark py-2 px-8 rounded-full">
                        Search
                    </button>
                </form>

                {loading && (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-28 bg-grey rounded-xl animate-pulse" />
                        ))}
                    </div>
                )}

                {!loading && searched && results.length === 0 && (
                    <div className="text-center py-16 text-dark-grey">
                        <i className="fi fi-rr-search text-5xl block mb-4" />
                        <p className="text-xl">No results found for "{query}"</p>
                    </div>
                )}

                {!loading && results.map((post, index) => (
                    <PostCard key={post._id} post={post} index={index} />
                ))}
            </div>
        </section>
    );
};

export default SearchPage;