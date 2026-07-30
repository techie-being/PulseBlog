import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiCpu } from "react-icons/fi";
import { FiCopy, FiCheck, FiX } from "react-icons/fi";

const AskAIModal = ({ open, loading, result, onClose }) => {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!open) return null;

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);

    if (key === "explanation") toast.success("Explanation copied!");
    else if (key === "analogy") toast.success("Analogy copied!");
    else if (key === "everything")
      toast.success("Copied everything successfully!");

    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center pt-24 pb-8 px-4 z-50 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl max-h-[82vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
              <FiCpu className="text-xl" />
            </div>
            <div className="flex items-center gap-3 bg-white border border-gray-200/80 px-4 py-3 rounded-2xl shadow-sm">
              
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <FiCpu className="text-lg" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-snug">
                  Ask AI
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  AI-powered breakdown and simplified insights
                </p>
              </div>
            </div>
            
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto space-y-6 bg-gray-50/30 flex-1">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium animate-pulse">
                AI is thinking...
              </p>
            </div>
          ) : (
            <>
              {/* Simple Explanation Section */}
              <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    💡 Simple Explanation
                  </h3>

                  <button
                    onClick={() =>
                      handleCopy("explanation", result?.simplified_explanation)
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      copiedKey === "explanation"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
                    }`}
                  >
                    {copiedKey === "explanation" ? <FiCheck /> : <FiCopy />}
                    {copiedKey === "explanation" ? "Copied!" : "Copy"}
                  </button>
                </div>

                <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
                  {result?.simplified_explanation}
                </p>
              </section>

              {/* Everyday Analogy Section */}
              <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    🌍 Everyday Analogy
                  </h3>

                  <button
                    onClick={() => handleCopy("analogy", result?.analogy)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      copiedKey === "analogy"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
                    }`}
                  >
                    {copiedKey === "analogy" ? <FiCheck /> : <FiCopy />}
                    {copiedKey === "analogy" ? "Copied!" : "Copy"}
                  </button>
                </div>

                <div className="bg-amber-50/60 border border-amber-100/60 rounded-2xl p-5 text-gray-800 leading-relaxed">
                  <p className="whitespace-pre-wrap">{result?.analogy}</p>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!loading && result && (
          <div className="flex justify-end px-8 py-4 border-t border-gray-100 bg-white flex-shrink-0">
            <button
              onClick={() =>
                handleCopy(
                  "everything",
                  `Simple Explanation\n\n${result?.simplified_explanation}\n\nEveryday Analogy\n\n${result?.analogy}`,
                )
              }
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
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
