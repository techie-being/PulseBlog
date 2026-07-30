import React from "react";

const TextSelectionPopup = ({
  visible,
  position,
  onAskAI,
  loading,
}) => {
  if (!visible) return null;

  return (
    <div
      className="absolute z-[9999]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <button
        onClick={onAskAI}
        disabled={loading}
        className="group relative inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray-900 bg-white border border-gray-300 shadow-md shadow-gray-200/50 hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none transition-all duration-300"
      >
        {loading ? (
          <>
            {/* Animated Loading Spinner */}
            <svg
              className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-gray-900"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Thinking...</span>
          </>
        ) : (
          <>
            <span className="text-xs transition-transform duration-300 group-hover:rotate-12">
              ✨
            </span>
            <span>Ask AI</span>
          </>
        )}
      </button>
    </div>
  );
};

export default TextSelectionPopup;