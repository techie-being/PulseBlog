import { useState } from "react";
import { simplifyText } from "../services/ai.service";

const useSimplifyText = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const askAI = async (selectedText) => {
    try {
      setLoading(true);
      setError(null);

      const data = await simplifyText(selectedText);

      setResult(data);

      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    askAI,
    result,
    loading,
    error,
  };
};

export default useSimplifyText;