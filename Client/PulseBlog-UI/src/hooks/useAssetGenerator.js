import { useState } from "react";
import { generateAssets } from "../services/ai.service";

const useAssetGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState(null);
  const [error, setError] = useState(null);

  const generate = async (postId) => {
    try {
      setLoading(true);
      setError(null);

      const assetsData = await generateAssets(postId);

      setAssets(assetsData);

      return assetsData;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generate,
    assets,
    loading,
    error,
  };
};

export default useAssetGenerator;