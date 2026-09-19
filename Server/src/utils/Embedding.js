import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN);

const generateEmbedding = async (text) => {
  if (!text) return null;

  try {
    const output = await client.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text,
    });

    if (!output) return null;

    // Ensure array is flattened to 1D vector float array
    const vector = Array.isArray(output) ? output.flat(Infinity) : output;
    return vector;
  } catch (error) {
    console.error("Hugging Face Embedding Error:", error?.message || error);
    return null;
  }
};

export { generateEmbedding };