import { Link } from "react-router-dom";

const PostCard = ({ post, index }) => {
    const {
        _id,
        title,
        mediaImage,
        owner,
        tags,
        createdAt,
        views,
        likeCount,
    } = post;

    const date = new Date(createdAt).toLocaleDateString("en-US", {
        year:  "numeric",
        month: "short",
        day:   "numeric",
    });

    return (
        <Link to={`/post/${_id}`} className="block group">
            <div className="flex gap-6 py-8 border-b border-grey">

                {/* Left: index number (decorative) */}
                {index !== undefined && (
                    <span className="blog-index">{String(index + 1).padStart(2, "0")}</span>
                )}

                {/* Centre: text content */}
                <div className="flex-1 min-w-0">
                    {/* Author row */}
                    <div className="flex items-center gap-2 mb-4">
                        <img
                            src={owner?.avatar || "https://via.placeholder.com/32"}
                            alt={owner?.username}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        />
                        <p className="text-sm text-dark-grey capitalize">
                            {owner?.username}
                        </p>
                        <span className="text-dark-grey text-sm">·</span>
                        <p className="text-sm text-dark-grey">{date}</p>
                    </div>

                    {/* Title */}
                    <h2 className="blog-title group-hover:underline mb-4">
                        {title}
                    </h2>

                    {/* Footer row: tags + stats */}
                    <div className="flex items-center gap-4 flex-wrap mt-2">
                        {tags?.slice(0, 3).map((tag, i) => (
                            <span key={i} className="tag text-sm py-1 px-3">
                                {tag}
                            </span>
                        ))}
                        <div className="ml-auto flex gap-4 text-dark-grey text-sm">
                            <span>
                                <i className="fi fi-rr-eye mr-1" />
                                {views ?? 0}
                            </span>
                            <span>
                                <i className="fi fi-rr-heart mr-1" />
                                {likeCount ?? 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: thumbnail */}
                {mediaImage && (
                    <div className="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden hidden sm:block">
                        <img
                            src={mediaImage}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        />
                    </div>
                )}
            </div>
        </Link>
    );
};

export default PostCard;