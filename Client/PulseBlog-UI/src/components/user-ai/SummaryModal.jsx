import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaRegFileAlt } from "react-icons/fa";
import { FiCheckCircle, FiCopy, FiCheck, FiX } from "react-icons/fi";

const SummaryModal = ({ open, data, onClose }) => {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!open || !data) return null;

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    
    if (key === "summary") toast.success("Summary copied!");
    else if (key === "takeaways") toast.success("Key takeaways copied!");
    else if (key === "everything") toast.success("Copied everything successfully!");

    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center pt-24 pb-8 px-4 z-50 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl max-h-[82vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <FaRegFileAlt className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Generated Summary</h2>
              <p className="text-sm text-gray-500">Review, copy, and export your content summary</p>
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
          
          {/* Summary Section */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                📝 Summary
              </h3>

              <button
                onClick={() => handleCopy("summary", data.summary)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  copiedKey === "summary"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
                }`}
              >
                {copiedKey === "summary" ? <FiCheck /> : <FiCopy />}
                {copiedKey === "summary" ? "Copied!" : "Copy"}
              </button>
            </div>

            <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
              {data.summary}
            </p>
          </section>

          {/* Key Takeaways Section */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <FiCheckCircle className="text-green-600" />
                Key Takeaways
              </h3>

              <button
                onClick={() => handleCopy("takeaways", data.keyTakeaways.join("\n"))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  copiedKey === "takeaways"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
                }`}
              >
                {copiedKey === "takeaways" ? <FiCheck /> : <FiCopy />}
                {copiedKey === "takeaways" ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="space-y-3">
              {data.keyTakeaways.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 text-gray-800 font-medium flex items-start gap-3"
                >
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full mt-0.5">
                    #{index + 1}
                  </span>
                  <p className="flex-1">{item}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-8 py-4 border-t border-gray-100 bg-white flex-shrink-0">
          <button
            onClick={() =>
              handleCopy(
                "everything",
                `Summary\n\n${data.summary}\n\nKey Takeaways\n\n• ${data.keyTakeaways.join("\n• ")}`
              )
            }
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              copiedKey === "everything"
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm"
            }`}
          >
            {copiedKey === "everything" ? <FiCheck /> : <FiCopy />}
            {copiedKey === "everything" ? "Copied Everything!" : "Copy Everything"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SummaryModal;