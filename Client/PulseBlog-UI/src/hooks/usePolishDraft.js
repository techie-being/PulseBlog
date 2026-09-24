import { useState } from "react";
import { polishDraft } from "../Services/ai.service.js";

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
    
    try {
      setLoading(true);

      const response = await polishDraft(blog, postId);
      if(response){
        console.log("AI response recieved")
      }
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
