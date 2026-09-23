import { Link, useNavigate } from "react-router-dom";

const PostCard = ({ post, index }) => {
  const navigate = useNavigate();

  const {
    _id,
    title = "Untitled Post",
    des,
    mediaImage,
    owner,
    views = 0,
    likeCount = 0,
    createdAt,
  } = post || {};

  // Utility to handle nested navigation without triggering the main Link
  const handleChildClick = (e, targetPath) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(targetPath);
  };

  // Safe Date Formatting
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Recently";

  return (
    <Link
      to={`/post/${_id}`}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 mb-4 sm:min-h-[180px] border border-slate-300 rounded-2xl dark:bg-slate-900 group transition-all duration-300 hover:border-indigo-500 shadow-sm hover:shadow-md overflow-hidden"
    >
      {/* MOBILE-ONLY TOP BAR: Author & Index Number */}
      <div className="flex sm:hidden items-center justify-between gap-2 shrink-0">
        <button
          type="button"
          onClick={(e) => handleChildClick(e, `/user/${owner?.username}`)}
          className="flex items-center gap-2 text-left focus:outline-none shrink-0"
        >
          {owner?.avatar ? (
            <img
              src={owner.avatar}
              alt={owner?.username || "Author"}
              className="w-5 h-5 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-purple/20 text-purple flex items-center justify-center font-bold text-[10px] shrink-0">
              {(owner?.username || "A").charAt(0).toUpperCase()}
            </div>
          )}
          <p className="text-xs text-dark-grey capitalize truncate max-w-[140px]">
            {owner?.username || "Anonymous"}
          </p>
          <span className="text-xs text-dark-grey">·</span>
          <p className="text-xs text-dark-grey shrink-0">{formattedDate}</p>
        </button>

        <span className="font-bold text-sm text-dark-grey/40 group-hover:text-purple transition-colors">
          {index !== undefined ? String(index + 1).padStart(2, "0") : ""}
        </span>
      </div>

      {/* PROMINENT IMAGE (First visual element on mobile) */}
      {mediaImage?.url && (
        <div className="w-full h-36 sm:hidden rounded-xl overflow-hidden shrink-0">
          <img
            src={mediaImage.url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      {/* LEFT COLUMN (Desktop unchanged) / MAIN TEXT (Mobile) */}
      <div className="flex flex-col justify-between flex-1 min-w-0 sm:h-full">
        <div className="overflow-hidden">
          {/* DESKTOP-ONLY AUTHOR ROW */}
          <div className="hidden sm:flex gap-2 items-center mb-1.5">
            <button
              type="button"
              onClick={(e) => handleChildClick(e, `/user/${owner?.username}`)}
              className="flex items-center gap-2 text-left group/author focus:outline-none shrink-0"
            >
              {owner?.avatar?.url ? (
                <img
                  src={owner.avatar.url}
                  alt={owner?.username || "Author"}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple/20 text-purple flex items-center justify-center font-bold text-xs shrink-0">
                  {(owner?.username || "A").charAt(0).toUpperCase()}
                </div>
              )}
              <p className="text-sm text-dark-grey capitalize group-hover/author:text-black dark:group-hover/author:text-white transition-colors truncate max-w-xs">
                {owner?.username || "Anonymous"}
              </p>
            </button>

            <span className="text-sm text-dark-grey">·</span>
            <p className="text-sm text-dark-grey shrink-0">{formattedDate}</p>
          </div>

          {/* Title */}
          <h2 className="blog-title text-base sm:text-lg font-bold line-clamp-2 group-hover:text-purple text-slate-900 dark:text-white transition-colors mb-1">
            {title}
          </h2>

          {/* Description */}
          {des && (
            <p className="text-xs sm:text-sm text-dark-grey line-clamp-2 leading-relaxed hidden sm:block">
              {des}
            </p>
          )}
        </div>

        {/* Bottom Stats Row */}
        <div className="flex items-center gap-4 text-xs sm:text-sm text-dark-grey shrink-0 pt-2 sm:pt-0">
          <span className="flex items-center gap-1">
            <i className="fi fi-rr-eye" /> {views}
          </span>
          <span className="flex items-center gap-1">
            <i className="fi fi-rr-heart" /> {likeCount}
          </span>
        </div>
      </div>

      {/* DESKTOP-ONLY RIGHT COLUMN */}
      <div className="hidden sm:flex flex-col justify-between items-end h-full shrink-0 min-w-[110px]">
        <span className="blog-index font-bold text-xl text-dark-grey/40 group-hover:text-purple transition-colors">
          {index !== undefined ? String(index + 1).padStart(2, "0") : ""}
        </span>

        {mediaImage?.url && (
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0">
            <img
              src={mediaImage.url}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
      </div>
    </Link>
  );
};

export default PostCard;
