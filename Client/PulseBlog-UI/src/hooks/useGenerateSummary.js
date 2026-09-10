import { useState } from "react";
import { generateSummary } from "../Services/ai.service.js";

const useGenerateSummary = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const generate = async (content) => {
    try {
      setLoading(true);
      setError(null);

      const data = await generateSummary(content);

      setSummary(data);

      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generate,
    summary,
    loading,
    error,
  };
};

export default useGenerateSummary;