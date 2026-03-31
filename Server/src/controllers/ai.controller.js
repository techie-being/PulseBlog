import { OpenAI } from "openai";
import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { client } from "../Config/ai.client.js";

//run before create post
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
    response_format: { tyre: "json_object" },
    messages: [
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

  const generatedAiSummary = JSON.parse(response.choices[0].message.content);

  return res.status(200).json(
    new Apiresponse({
      status: 200,
      data: generatedAiSummary,
      message: "Generated data successfully",
    }),
  );
});

//run after create post
const assetGenerator = Asynchandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new Apierror(400, "Content is required");
  }

  if (content.length > 30000) {
    throw new Apierror(400, "Content length is out of bound for free models");
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o",

    response_format: { type: "json_object" },

    messages: [
      {
        role: "system",
        content: `
          You are an expert social media manager and copywriter. Read the provided blog post and generate promotional assets to help the author share their work. 
          You MUST return a valid JSON object in this exact format:

          {
            "twitter_thread": [
              "Tweet 1: A strong hook summarizing the core value.", 
              "Tweet 2: A supporting point or interesting fact from the post.", 
              "Tweet 3: A call-to-action with relevant hashtags linking to the post."
            ],
            "linkedin_post": "A professional, engaging 3-4 paragraph post with appropriate emojis and a call-to-action.",
            "viral_hooks": [
              "Catchy hook sentence 1", 
              "Catchy hook sentence 2", 
              "Catchy hook sentence 3"
            ]
          }`,
      },

      {
        role: "user",
        content: `Here is the blog post content to analyze: ${content}`,
      },
    ],
    temperature: 0.7,
  });

  const generatedAsset = JSON.parse(response.choices[0].message.content);

  return res.status(200).json(
    new Apiresponse({
      status: 200,
      data: generatedAsset,
      message: "social media posts are generated",
    }),
  );
});

//run before create post
