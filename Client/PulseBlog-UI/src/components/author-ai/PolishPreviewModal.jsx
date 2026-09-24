import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiX,
  FiStar,
  FiTag,
  FiType,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";

const PolishPreviewModal = ({
  open,
  review,
  titleSuggestion,
  headingSuggestions = [],
  tagSuggestions,
  paragraphSuggestions = [],
  content,
  setContent,
  editorRef,
  setTitle,
  setTags,
  onClose,
}) => {
  const [appliedMap, setAppliedMap] = useState({});

  // Reset applied state when modal opens
  useEffect(() => {
    if (open) {
      setAppliedMap({});
    }
  }, [open]);

  // Handle Escape Key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const markApplied = (id) => {
    setAppliedMap((prev) => ({ ...prev, [id]: true }));
  };

  const onApply = async (item, itemKey) => {
    try {
      switch (item.type) {
        case "title":
          if (setTitle && item.improved) {
            setTitle(item.improved);
            markApplied(itemKey);
            toast.success("Title updated!");
          }
          break;

        case "tags":
          if (setTags && Array.isArray(item.tags)) {
            setTags(item.tags.join(", "));
            markApplied(itemKey);
            toast.success("Tags updated!");
          }
          break;

        case "heading":
        case "paragraph": {
          if (!content?.blocks || item.blockIndex == null) {
            toast.error("Invalid editor content structure.");
            return;
          }

          const updatedContent = structuredClone(content);

          if (!updatedContent.blocks[item.blockIndex]) {
            toast.error(`Block index #${item.blockIndex} not found.`);
            return;
          }

          updatedContent.blocks[item.blockIndex].data.text = item.improved;

          setContent(updatedContent);

          if (editorRef?.current?.render) {
            await editorRef.current.render(updatedContent);
          }

          markApplied(itemKey);
          toast.success("Block text updated!");
          break;
        }

        default:
          console.warn("Unknown suggestion type:", item);
      }
    } catch (err) {
      console.error("Apply Failed:", err);
      toast.error("Failed to apply suggestion");
    }
  };

  const handleApplyAll = async () => {
    let appliedCount = 0;

    // Apply title
    if (titleSuggestion && !appliedMap["title"]) {
      setTitle?.(titleSuggestion.improved);
      markApplied("title");
      appliedCount++;
    }

    // Apply tags
    if (tagSuggestions?.tags?.length > 0 && !appliedMap["tags"]) {
      setTags?.(tagSuggestions.tags.join(", "));
      markApplied("tags");
      appliedCount++;
    }

    // Apply headings and paragraphs batch
    if (content?.blocks) {
      const updatedContent = structuredClone(content);
      let editorNeedsUpdate = false;

      // Headings
      headingSuggestions.forEach((item, index) => {
        const key = `heading-${index}`;
        if (!appliedMap[key] && updatedContent.blocks[item.blockIndex]) {
          updatedContent.blocks[item.blockIndex].data.text = item.improved;
          markApplied(key);
          editorNeedsUpdate = true;
          appliedCount++;
        }
      });

      // Paragraphs
      paragraphSuggestions.forEach((item, index) => {
        const key = `para-${index}`;
        if (!appliedMap[key] && updatedContent.blocks[item.blockIndex]) {
          updatedContent.blocks[item.blockIndex].data.text = item.improved;
          markApplied(key);
          editorNeedsUpdate = true;
          appliedCount++;
        }
      });

      if (editorNeedsUpdate) {
        setContent(updatedContent);
        if (editorRef?.current?.render) {
          await editorRef.current.render(updatedContent);
        }
      }
    }

    if (appliedCount > 0) {
      toast.success(`Applied ${appliedCount} suggestion(s)!`);
    } else {
      toast("All suggestions are already applied.");
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl lg:max-w-4xl max-h-[80vh] sm:max-h-[85vh] flex flex-col rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-auto"
      >
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:px-6 sm:py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0 gap-3 sm:gap-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2.5 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
              <FiStar className="text-lg sm:text-xl" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug truncate">
                AI Article Review & Polish
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate">
                Refine structure, grammar, and engagement
              </p>
            </div>
            {/* Mobile close button (top right) */}
            <button
              onClick={onClose}
              className="p-1.5 sm:hidden text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors ml-auto"
              aria-label="Close modal"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end w-full sm:w-auto">
            <button
              onClick={handleApplyAll}
              className="w-full sm:w-auto px-3.5 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <FiCheckCircle /> Apply All Suggestions
            </button>
            {/* Desktop close button */}
            <button
              onClick={onClose}
              className="hidden sm:block p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-4 sm:space-y-6 bg-gray-50/30 flex-1">
          {/* Overall Review Score Card */}
          {review && (
            <div className="bg-slate-900 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 sm:pb-4 mb-3 sm:mb-4 gap-2 sm:gap-0">
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Overall Evaluation
                </h3>
                <span className="self-start sm:self-auto bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs">
                  Score: {review.overallScore ?? "N/A"} / 10
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {review.overallFeedback}
              </p>
            </div>
          )}

          {/* Title Suggestion */}
          {titleSuggestion && (
            <SuggestionCard
              icon={<FiType className="text-indigo-600 text-lg sm:text-xl shrink-0" />}
              title="Improved Title"
              isApplied={appliedMap["title"]}
              onApply={() =>
                onApply(
                  { ...titleSuggestion, type: "title" },
                  "title"
                )
              }
            >
              <DiffView
                original={titleSuggestion.original}
                improved={titleSuggestion.improved}
              />
              {titleSuggestion.reason && (
                <p className="text-[11px] sm:text-xs text-gray-500 mt-2 sm:mt-3 font-medium">
                  💡 {titleSuggestion.reason}
                </p>
              )}
            </SuggestionCard>
          )}

          {/* Tag Suggestions */}
          {tagSuggestions?.tags?.length > 0 && (
            <SuggestionCard
              icon={<FiTag className="text-purple-600 text-lg sm:text-xl shrink-0" />}
              title="Recommended Tags"
              isApplied={appliedMap["tags"]}
              onApply={() =>
                onApply(
                  { ...tagSuggestions, type: "tags" },
                  "tags"
                )
              }
            >
              <div className="flex flex-wrap gap-1.5 sm:gap-2 my-2">
                {tagSuggestions.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 sm:px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-[11px] sm:text-xs font-semibold break-all"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </SuggestionCard>
          )}

          {/* Heading Suggestions */}
          {headingSuggestions.map((item, index) => {
            const key = `heading-${index}`;
            return (
              <SuggestionCard
                key={key}
                icon={<FiFileText className="text-blue-600 text-lg sm:text-xl shrink-0" />}
                title={`Heading Optimization (Block #${item.blockIndex + 1})`}
                isApplied={appliedMap[key]}
                onApply={() =>
                  onApply(
                    { ...item, type: "heading" },
                    key
                  )
                }
              >
                <DiffView original={item.original} improved={item.improved} />
              </SuggestionCard>
            );
          })}

          {/* Paragraph Suggestions */}
          {paragraphSuggestions.length === 0 ? (
            <div className="text-center py-6 sm:py-8 px-4 bg-emerald-50/50 border border-emerald-100 rounded-xl sm:rounded-2xl">
              <h3 className="text-base sm:text-lg font-bold text-emerald-800">
                🎉 Paragraphs Look Great!
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs text-emerald-600">
                No major structural revisions were needed for your body text.
              </p>
            </div>
          ) : (
            paragraphSuggestions.map((item, index) => {
              const key = `para-${index}`;
              return (
                <SuggestionCard
                  key={key}
                  icon={<FiFileText className="text-amber-600 text-lg sm:text-xl shrink-0" />}
                  title={`Paragraph ${item.blockIndex + 1}`}
                  badge={item.reason}
                  isApplied={appliedMap[key]}
                  onApply={() =>
                    onApply(
                      { ...item, type: "paragraph" },
                      key
                    )
                  }
                >
                  <DiffView original={item.original} improved={item.improved} />
                </SuggestionCard>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-8 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

const SuggestionCard = ({
  icon,
  title,
  badge,
  children,
  onApply,
  isApplied,
}) => (
  <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2.5 sm:gap-4">
      <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
        {icon}
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{title}</h4>
          {badge && (
            <span className="inline-block mt-0.5 sm:mt-1 bg-amber-50 text-amber-700 border border-amber-100 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium break-words">
              {badge}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onApply}
        disabled={isApplied}
        className={`w-full sm:w-auto justify-center px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
          isApplied
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
            : "bg-gray-900 hover:bg-gray-800 text-white shadow-sm active:scale-95"
        }`}
      >
        {isApplied ? (
          <>
            <FiCheck className="text-emerald-600" /> Applied
          </>
        ) : (
          "Apply Fix"
        )}
      </button>
    </div>
    {children}
  </div>
);

const DiffView = ({ original, improved }) => (
  <div className="space-y-2.5 sm:space-y-3 mt-2 text-[11px] sm:text-xs">
    {original && (
      <div className="bg-red-50/70 border border-red-100 rounded-xl p-2.5 sm:p-3 text-red-800">
        <span className="font-bold uppercase tracking-wider text-[9px] sm:text-[10px] text-red-500 block mb-0.5 sm:mb-1">
          Original Text
        </span>
        <p className="whitespace-pre-wrap leading-relaxed break-words">{original}</p>
      </div>
    )}
    {improved && (
      <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5 sm:p-3 text-emerald-900">
        <span className="font-bold uppercase tracking-wider text-[9px] sm:text-[10px] text-emerald-600 block mb-0.5 sm:mb-1">
          Suggested Revision
        </span>
        <p className="whitespace-pre-wrap leading-relaxed break-words">{improved}</p>
      </div>
    )}
  </div>
);

export default PolishPreviewModal;