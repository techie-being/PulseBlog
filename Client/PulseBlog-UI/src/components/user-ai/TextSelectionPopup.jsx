import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const TextSelectionPopup = ({ visible, position, onAskAI, loading }) => {
  useEffect(() => {
    if (!visible) return;

    const handleScroll = () => {
      // Hide popup when user starts scrolling
      // This prevents the button from floating away from the selection.
      window.getSelection()?.removeAllRanges();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [visible]);

  if (!visible) return null;

  const safeX = Math.min(
    Math.max(position.x, 70),
    window.innerWidth - 70
  );

  const safeY = Math.max(position.y, 60);

  return createPortal(
    <div
      className="fixed z-[99999] pointer-events-auto"
      style={{
        left: `${safeX}px`,
        top: `${safeY}px`,
        transform: "translate(-50%, 0)",
      }}
    >
      <button
        type="button"
        onClick={onAskAI}
        disabled={loading}
        className="group relative inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold text-gray-900 bg-white border border-gray-300 shadow-md shadow-gray-200/50 hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none transition-all duration-300 touch-manipulation whitespace-nowrap"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-0.5 sm:-ml-1 mr-0.5 sm:mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-900 shrink-0"
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
              />

              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>

            <span className="text-[11px] sm:text-xs">
              Thinking...
            </span>
          </>
        ) : (
          <>
            <span className="text-[10px] sm:text-xs transition-transform duration-300 group-hover:rotate-12 shrink-0">
              ASK AI✨
            </span>

            <span className="text-[11px] sm:text-xs">
              Ask AI
            </span>
          </>
        )}
      </button>
    </div>,
    document.body
  );
};

export default TextSelectionPopup;