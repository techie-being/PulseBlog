import  OpenAI  from "openai";
const client = new OpenAI({
  apiKey: process.env.GITHUB_SECRET_API_KEY,
  baseURL: "https://models.inference.ai.azure.com",
  headers: {
  "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`, // Ensure 'Bearer ' is there
  "Content-Type": "application/json"
}
});
export {client}