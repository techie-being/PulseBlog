import openai, { OpenAI } from "openai";
import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";

const client = new OpenAI({
  apiKey: process.env.GITHUB_SECRET_API_KEY,
  baseURL: "https://models.inference.ai.azure.com",
});

const generateAiSummary = Asynchandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new Apierror(400, "content is required");
  }

  if (content.length > 30000) {
    throw new Apierror(400, "you are going out of bounds of AI Magic! limit");
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { tyre: json_object },
    prompt: [
      {
        role: "system",
        content: `You are an expert blog editor. Analyze the provided blog draft and perform two tasks:
          1. Write a summary that is exactly or around 100 words.
          2. Generate appropriate, SEO-friendly subheadings (H2/H3 level) for the different main sections or paragraphs of the draft. Keep them chronological to the text.
          
          You MUST return a valid JSON object in this exact format:
          {
            "summary": "Your 100-word summary here.",
            "headings": ["Heading for Intro/Section 1", "Heading for Section 2", "Heading for Conclusion"]
          }`,
      },

      {
        role: "user",
        content: `Draft Content: ${content}`,
      },
    ],
    temperature: 0.7,
  });

  const generatedData = JSON.parse(response.choices[0].message.content);

  return res
  .status(200)
  .json(
    new Apiresponse(
        {
            status:200,
            data:generateAiSummary,
            message:"Generated data successfully"
        }
    )
  )
});
