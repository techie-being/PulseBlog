import { useState } from "react";
import { polishDraft } from "../services/ai.service";

export default function usePolishDraft() {
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [headingSuggestions, setHeadingSuggestions] = useState([]);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [paragraphSuggestions, setParagraphSuggestions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [review, setReview] = useState(null);
  const [titleSuggestion, setTitleSuggestion] = useState(null);
  const runPolish = async (blog, postId) => {
    console.log("runPolish called");
    console.log(blog);
    console.log(postId);

    try {
      setLoading(true);

      const response = await polishDraft(blog, postId);
      console.log("AI Response:", response);
      setReview({
        overallScore: response.overallScore,
        overallFeedback: response.overallFeedback,
      });

      setTitleSuggestion(response.titleSuggestion);

      setHeadingSuggestions(response.headingSuggestions || []);

      setTagSuggestions(response.tagSuggestions || []);

      setParagraphSuggestions(response.paragraphSuggestions || []);

      
      setShowPreview(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
  loading,
  review,

  titleSuggestion,
  headingSuggestions,
  tagSuggestions,
  paragraphSuggestions,

  showPreview,
  setShowPreview,
  runPolish,
};
}
