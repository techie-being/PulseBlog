import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiCpu, FiCopy, FiCheck, FiX } from "react-icons/fi";

const AskAIModal = ({ open, loading, result, onClose }) => {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!open) return null;

  const handleCopy = (key, text) => {
    if (!text) return toast.error("Nothing to copy!");
    navigator.clipboard.writeText(text);
    setCopiedKey(key);

    if (key === "explanation") toast.success("Explanation copied!");
    else if (key === "analogy") toast.success("Analogy copied!");
    else if (key === "everything") toast.success("Copied everything successfully!");

    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 z-50 overflow-y-auto animate-fadeIn">
      {/* Optimized Modal Container for Mobile & Laptops */}
      <div className="bg-white w-full max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] sm:max-h-[85vh] md:max-h-[80vh] flex flex-col rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-3 bg-purple-50 text-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <FiCpu className="text-lg sm:text-xl" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                Ask AI
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                AI-powered breakdown and simplified insights
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <FiX className="text-lg sm:text-xl" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-4 sm:space-y-6 bg-gray-50/30 flex-1">
          {loading ? (
            <div className="py-12 sm:py-20 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm sm:text-base text-gray-500 font-medium animate-pulse">
                AI is thinking...
              </p>
            </div>
          ) : (
            <>
              {/* Simple Explanation Section */}
              <section className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-900">
                    💡 Simple Explanation
                  </h3>

                  <button
                    onClick={() =>
                      handleCopy("explanation", result?.simplified_explanation)
                    }
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      copiedKey === "explanation"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
                    }`}
                  >
                    {copiedKey === "explanation" ? <FiCheck /> : <FiCopy />}
                    {copiedKey === "explanation" ? "Copied!" : "Copy"}
                  </button>
                </div>

                <p className="text-xs sm:text-sm md:text-base leading-relaxed whitespace-pre-wrap text-gray-700">
                  {result?.simplified_explanation || "No explanation available."}
                </p>
              </section>

              {/* Everyday Analogy Section */}
              <section className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-900">
                    🌍 Everyday Analogy
                  </h3>

                  <button
                    onClick={() => handleCopy("analogy", result?.analogy)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      copiedKey === "analogy"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
                    }`}
                  >
                    {copiedKey === "analogy" ? <FiCheck /> : <FiCopy />}
                    {copiedKey === "analogy" ? "Copied!" : "Copy"}
                  </button>
                </div>

                <div className="bg-amber-50/60 border border-amber-100/60 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-gray-800 leading-relaxed">
                  <p className="text-xs sm:text-sm md:text-base whitespace-pre-wrap">
                    {result?.analogy || "No analogy available."}
                  </p>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!loading && result && (
          <div className="flex justify-end px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-t border-gray-100 bg-white flex-shrink-0">
            <button
              onClick={() =>
                handleCopy(
                  "everything",
                  `Simple Explanation\n\n${result?.simplified_explanation || ""}\n\nEveryday Analogy\n\n${result?.analogy || ""}`
                )
              }
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                copiedKey === "everything"
                  ? "bg-emerald-600 text-white"
                  : "bg-purple-600 text-white hover:bg-purple-700 active:scale-95 shadow-sm"
              }`}
            >
              {copiedKey === "everything" ? <FiCheck /> : <FiCopy />}
              {copiedKey === "everything"
                ? "Copied Everything!"
                : "Copy Everything"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AskAIModal;