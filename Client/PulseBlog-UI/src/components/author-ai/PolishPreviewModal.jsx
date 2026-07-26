const PolishPreviewModal = ({
  open,
  review,

  titleSuggestion,
  headingSuggestions,
  tagSuggestions,
  paragraphSuggestions,

  content,
  setContent,

  editorRef,

  setTitle,
  setTags,

  onClose,
}) => {
  if (!open) return null;

  const onApply = async (item) => {
    console.log("Applying:", item);

    switch (item.type) {
      case "title":
        setTitle(item.improved);
        console.log("✅ Title Updated");
        break;

      case "tags":
        setTags(item.tags.join(", "));
        console.log("✅ Tags Updated");
        break;

      case "heading":
      case "paragraph": {
        try {
          const updatedContent = structuredClone(content);

          console.log(
            "Updating Block:",
            item.blockIndex,
            updatedContent.blocks[item.blockIndex]
          );

          updatedContent.blocks[item.blockIndex].data.text = item.improved;

          setContent(updatedContent);

          if (editorRef?.current?.render) {
            await editorRef.current.render(updatedContent);
          }

          console.log("✅ Editor Updated");
        } catch (err) {
          console.error("Apply Failed:", err);
        }

        break;
      }

      default:
        console.warn("Unknown suggestion:", item);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="
          bg-white
          rounded-2xl
          shadow-2xl
          w-[850px]
          max-w-[90vw]
          max-h-[85vh]
          overflow-y-auto
          p-8
          animate-scaleIn
        "
      >
        <h2 className="text-2xl font-bold mb-6">AI Suggestions</h2>

        {/* Overall Review */}
        <div className="bg-slate-50 rounded-xl p-5 mb-6">
          <h3 className="text-xl font-bold">Overall Review</h3>

          <p className="mt-2">
            <strong>Score:</strong> {review?.overallScore}/10
          </p>

          <p className="mt-3">{review?.overallFeedback}</p>
        </div>

        {/* Title Suggestion */}
        {titleSuggestion && (
          <div className="border rounded-xl p-5 mb-5">
            <h3 className="text-lg font-bold mb-3">Improved Blog Title</h3>

            <p className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {titleSuggestion.original}
            </p>

            <p className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4 text-emerald-700">
              {titleSuggestion.improved}
            </p>

            <p className="text-sm text-gray-500 mt-3">
              {titleSuggestion.reason}
            </p>

            <button
              className="btn-dark mt-4"
              onClick={() =>
                onApply({
                  ...titleSuggestion,
                  type: "title",
                })
              }
            >
              Apply Title
            </button>
          </div>
        )}

        {/* Heading Suggestions */}
        {headingSuggestions?.map((item, index) => (
          <div key={index} className="border rounded-xl p-5 mb-5">
            <h3 className="font-bold text-lg">Heading Improvement</h3>

            <p className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3 text-red-700">
              {item.original}
            </p>

            <p className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4 text-emerald-700">
              {item.improved}
            </p>

            <button
              className="btn-dark mt-4"
              onClick={() =>
                onApply({
                  ...item,
                  type: "heading",
                })
              }
            >
              Apply
            </button>
          </div>
        ))}

        {/* Tag Suggestions */}
        {tagSuggestions?.tags?.length > 0 && (
          <div className="border rounded-xl p-5 mb-5">
            <h3 className="font-bold text-lg mb-4">Recommended Tags</h3>

            <div className="flex flex-wrap gap-3">
              {tagSuggestions.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full bg-purple-100 text-purple-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            <button
              className="btn-dark mt-5"
              onClick={() => onApply(tagSuggestions)}
            >
              Apply Tags
            </button>
          </div>
        )}

        {/* Paragraph Suggestions */}
        {paragraphSuggestions?.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-2xl font-bold text-green-600">
              🎉 Excellent!
            </h3>

            <p className="mt-4 text-gray-600">
              Your article already looks professionally written.
            </p>
          </div>
        ) : (
          paragraphSuggestions.map((item, index) => (
            <div key={index} className="border rounded-xl p-5 mb-5">
              <h4 className="font-bold">
                Paragraph {item.blockIndex + 1}
              </h4>

              <span className="inline-flex bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium mt-2">
                {item.reason}
              </span>

              <hr className="my-4" />

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-700 mb-2">
                  Original
                </p>

                <p className="text-red-700 whitespace-pre-wrap">
                  {item.original}
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
                <p className="text-sm font-semibold text-emerald-700 mb-2">
                  Improved
                </p>

                <p className="text-emerald-700 whitespace-pre-wrap">
                  {item.improved}
                </p>
              </div>

              <button
                className="btn-dark mt-5"
                onClick={() =>
                  onApply({
                    ...item,
                    type: "paragraph",
                  })
                }
              >
                Apply
              </button>
            </div>
          ))
        )}

        <button className="btn-light mt-5" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default PolishPreviewModal;