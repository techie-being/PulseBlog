import  OpenAI  from "openai";
const client = new OpenAI({
  apiKey: process.env.GITHUB_SECRET_API_KEY,
  baseURL: "https://models.inference.ai.azure.com",
});
export {client}