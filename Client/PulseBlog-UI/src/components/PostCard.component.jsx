import { Link } from "react-router-dom";

const PostCard = ({ post, index }) => {
    const {
           _id, title, mediaImage,
        owner, tags = [], views = 0,
            likeCount = 0, createdAt,
    } = post;

    return (
            <Link to={`/post/${_id}`} className="flex gap-6 py-8 border-b border-grey group transition-all duration-300 hover:pl-2">
            <div className="flex-1 min-w-0">
            <div className="flex gap-2 items-center mb-3">
                    <img
                     src={owner?.avatar}
                      alt={owner?.username}
                        className="w-6 h-6 rounded-full object-cover"
                    />
                <p className="text-sm text-dark-grey capitalize">{owner?.username}</p>
                    <p className="text-sm text-dark-grey">·</p>
                 <p className="text-sm text-dark-grey">
                        {new Date(createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric",
                        })}
                    </p>
                </div>

                <h2 className="blog-title group-hover:text-purple transition mb-2">
                    {title}
                </h2>

                <div className="flex gap-2 flex-wrap mb-3">
                 {tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag text-sm">{tag}</span>
                    ))}
                </div>

            <div className="flex gap-4 text-sm text-dark-grey">
                    <span><i className="fi fi-rr-eye mr-1" />{views}</span>
                    <span><i className="fi fi-rr-heart mr-1" />{likeCount}</span>
                </div>
            </div>

            <div className="flex flex-col items-end justify-between min-w-[120px]">
                <span className="blog-index">{String(index + 1).padStart(2, "0")}</span>
                {mediaImage && (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-md hidden sm:block">
                        <img
                            src={mediaImage}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                )}
            </div>
        </Link>
    );
};

export default PostCard;