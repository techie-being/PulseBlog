import axiosInstance from "../api/axiosInstance";

export const polishDraft = async (blog, postId) => {
  console.log("STEP 3 - ai.service");

  const { data } = await axiosInstance.post(
    "/ai/polished-draft",
    {
      blog,
      postId,
    }
  );

  return data.data;
};

export const generateAssets = async (content) => {
    const { data } = await axiosInstance.post("/ai/asset-generator", {
        content,
    });

    return data.data;
};

export const generateSummary = async (content) => {
    const { data } = await axiosInstance.post("/ai/ai-summary", {
        content,
    });

    return data.data;
};

export const simplifyText = async (content) => {
    const { data } = await axiosInstance.post("/ai/simplify", {
        draftContent: content,
    });

    return data.data;
};