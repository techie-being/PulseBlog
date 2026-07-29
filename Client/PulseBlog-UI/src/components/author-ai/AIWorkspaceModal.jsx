const AIWorkspaceModal = ({ open, onClose, onPolish, onAssets, loading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[650px] p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">✨ AI Assistant</h2>

          <button onClick={onClose} className="text-2xl">
            ✕
          </button>
        </div>

        <div className="space-y-5">
          <div className="border rounded-xl p-5">
            <h3 className="font-semibold text-lg">Polish Draft</h3>

            <p className="text-sm text-gray-500 mt-2">
              Review your entire article and suggest improvements.
            </p>

            <button
              onClick={onPolish}
              disabled={loading}
              className="btn-dark mt-5"
            >
              {loading ? "Reviewing..." : "Start Review"}
            </button>

            
          </div>

          <div className="border rounded-xl p-5">
            <h3 className="font-semibold text-lg">Generate Assets</h3>

            <p className="text-sm text-gray-500 mt-2">
              Generate social media posts.
            </p>

            <button
              onClick={onAssets}
              disabled={loading}
              className="btn-dark transition-all duration-300 hover:bg-black hover:text-white hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50"
            >
              {loading ? "Generating..." : "🚀 Generate Assets"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWorkspaceModal;
