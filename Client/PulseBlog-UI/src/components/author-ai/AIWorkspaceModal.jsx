import React, { useState } from "react";
import { FiX, FiEdit3, FiShare2, FiLoader } from "react-icons/fi";

const AIWorkspaceModal = ({ open, onClose, onPolish, onAssets, loading }) => {
  const [activeAction, setActiveAction] = useState(null);

  if (!open) return null;

  const handlePolishClick = async () => {
    setActiveAction("polish");
    await onPolish?.();
    setActiveAction(null);
  };

  const handleAssetsClick = async () => {
    setActiveAction("assets");
    await onAssets?.();
    setActiveAction(null);
  };

  const isGlobalLoading = Boolean(loading);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-3xl w-full max-w-[620px] p-8 shadow-2xl border border-gray-100 overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
              <p className="text-xs text-gray-500 font-medium">Select an action to enhance your content workspace</p>
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

        {/* Modal Options Grid */}
        <div className="space-y-4">
          
          {/* Polish Draft Card */}
          <div className="group border border-gray-100 hover:border-purple-200 bg-gray-50/40 hover:bg-purple-50/30 rounded-2xl p-5 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FiEdit3 className="text-purple-600 text-base" />
                <h3 className="font-bold text-gray-900 text-base">Polish Draft</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                Review your entire article, improve tone, and surface contextual edits.
              </p>
            </div>

            <button
              onClick={handlePolishClick}
              disabled={isGlobalLoading || activeAction === "polish"}
              className="px-5 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm"
            >
              {activeAction === "polish" ? (
                <>
                  <FiLoader className="animate-spin text-sm" />
                  <span>Reviewing...</span>
                </>
              ) : (
                <span>Start Review</span>
              )}
            </button>
          </div>

          {/* Generate Assets Card */}
          <div className="group border border-gray-100 hover:border-indigo-200 bg-gray-50/40 hover:bg-indigo-50/30 rounded-2xl p-5 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FiShare2 className="text-indigo-600 text-base" />
                <h3 className="font-bold text-gray-900 text-base">Generate Assets</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                Automatically generate social media posts and promotional clips.
              </p>
            </div>

            <button
              onClick={handleAssetsClick}
              disabled={isGlobalLoading || activeAction === "assets"}
              className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm"
            >
              {activeAction === "assets" ? (
                <>
                  <FiLoader className="animate-spin text-sm" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>🚀 Generate Assets</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AIWorkspaceModal;