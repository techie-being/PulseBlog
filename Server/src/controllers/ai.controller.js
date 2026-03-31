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
        content: `here is Draft Content that you have to summarize : ${content}`,
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
const simplifyText = Asynchandler(async (req, res) => {
  const { selectedText } = req.body;

  if (!selectedText) {
    throw new Apierror(400, "Text field is empty");
  }

  if (selectedText.length > 2000) {
    throw new Apierror(400, "Text length should be less.");
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: 
        `You are an expert teacher who excels at breaking down complex concepts. The user will provide a specific technical or dense paragraph from a blog post. 
        Rewrite the core concept so simply that a beginner or a child could understand it. You must include a highly relatable, everyday analogy.
        You MUST return a valid JSON object in this exact format:
        {
          "simplified_explanation": "Your clear, jargon-free explanation here.",
          "analogy": "Think of it like..."
        }`,
      },
      {
        role:"user",
        content:`here is the text content that you have to initalize ${selectedText}`,
      }
    ],
    temperature:0.6,
  });

  const simplifiedText = JSON.parse(response.choices[0].message.content);

  return res
  .status(200)
  .json(
    new Apiresponse(
      {
        status:200,
        data:simplifiedText,
        message:"selected text simplified successfully",
      }
    )
  )
});

const polishDraft = Asynchandler(async (req, res) => {
  const { draftContent } = req.body;

  if (!draftContent) {
    throw new Apierror(400, "Draft content is required for polishing.");
  }

  if (draftContent.length > 30000) {
    throw new Apierror(400, "Draft is too long for the AI polisher limit.");
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o", 
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
        You are a professional copyeditor. Read the provided blog draft and identify up to 3 sentences that are clunky, awkwardly phrased, grammatically incorrect, or hard to read. 
        For each identified sentence, provide a polished, professional improvement that maintains the author's original meaning.

        You MUST return a valid JSON object in this exact format:
        {
          "suggestions": [
            {
              "original_sentence": "The exact clunky sentence pulled from the text.",
              "improved_sentence": "Your rewritten, polished version.",
              "explanation": "A brief, 1-sentence reason for the change."
            }
          ]
        }
        `
      },
      {
        role: "user",
        content: `Here is the draft to polish: ${draftContent}`
      }
    ],
    temperature: 0.3,
  });

  const polishedData = JSON.parse(response.choices[0].message.content);

  return res
  .status(200)
  .json(
    new Apiresponse(
      {
        status:200,
        data:polishedData,
        message:"selected text simplified successfully",
      }
    )
  );
  
});

export { 
  polishDraft,
  simplifyText,
  assetGenerator,
  generateAiSummary,
};
