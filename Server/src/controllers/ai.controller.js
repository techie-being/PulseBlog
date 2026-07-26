import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { client } from "../Config/ai.client.js";

import { Post } from "../models/post.models.js";

//run before create post
const generateAiSummary = Asynchandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new Apierror(400, "content is required");
  }

  if (content.length > 30000) {
    throw new Apierror(400, "you are going out of bounds of AI Magic! limit");
  }

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
    You are an expert blog editor.
 
    Analyze the provided blog draft and perform two tasks:

    1. Improve this blog post optmize its wording and grammmar according to needs.
    2. Generate appropriate, SEO-friendly H2/H3 headings for the different sections. Keep them chronological.
    Return ONLY valid JSON.
    Do not wrap the JSON in markdown or code fences
    Return ONLY valid JSON in this exact format:
{
  "optimized": ".",
  "headings": [
    "Heading for Intro/Section 1",
    "Heading for Section 2",
    "Heading for Conclusion"
  ]
}
    Draft Content:${content}`,
    config: {
      temperature: 0.7,

      // Strongly encourages JSON output
      responseMimeType: "application/json",
    },
  });
  const text = response.text;
  const generatedAiSummary = JSON.parse(text);

  if (!generatedAiSummary) {
    throw new Apierror(400, "summary is not generated from ai");
  }

  return res
    .status(200)
    .json(
      new Apiresponse(200, generatedAiSummary, "Generated data successfully"),
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

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",

    contents: `
    You are an expert teacher who excels at breaking down complex concepts.

    The user will provide a specific technical or dense paragraph from a blog post.

    Rewrite the core concept so simply that a beginner or a child could understand it.

    Include a highly relatable, everyday analogy.

    Return ONLY valid JSON.
    Do not wrap the JSON in markdown or code fences.

{
  "simplified_explanation": "Your clear, jargon-free explanation here.",
  "analogy": "Think of it like..."
}

Text to simplify:${selectedText}`,

    config: {
      temperature: 0.6,
      responseMimeType: "application/json",
    },
  });
  const text = response.text;
  const simplifiedText = JSON.parse(text);

  return res
    .status(200)
    .json(
      new Apiresponse(
        200,
        simplifiedText,
        "selected text simplified successfully",
      ),
    );
});

const polishDraft = Asynchandler(async (req, res) => {
  const { blog, postId } = req.body;
  const { title, tags, content } = blog;

  if (postId) {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Apierror(404, "Post not found");
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      throw new Apierror(401, "Unauthorized");
    }
  }

  const formattedBlocks = content.blocks
    .map((block, index) => {
      switch (block.type) {
        case "header":
          return `[BLOCK ${index}]
Heading:
${block.data.text}`;

        case "paragraph":
          return `[BLOCK ${index}]
Paragraph:
${block.data.text}`;

        case "list":
          return `[BLOCK ${index}]
List:
${block.data.items.join("\n")}`;

        case "quote":
          return `[BLOCK ${index}]
Quote:
${block.data.text}`;

        case "code":
          return `[BLOCK ${index}]
Code:
${block.data.code}`;

        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");

  try {
    console.time("polish");
    console.log("1. Controller Started");

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",

      contents: `
You are a senior technical editor working for Medium.

Review the article professionally.

DO NOT rewrite the whole article.

Suggest improvements only where needed.

Return ONLY valid JSON.

Do NOT use markdown.
Do NOT wrap JSON inside code fences.

Return EXACTLY this schema:

{
  "overallScore": 8.5,
  "overallFeedback": "...",

  "titleSuggestion": {
    "type": "title",
    "original": "...",
    "improved": "...",
    "reason": "..."
  },

  "headingSuggestions": [
    {
      "type": "heading",
      "blockIndex": 0,
      "original": "...",
      "improved": "...",
      "reason": "..."
    }
  ],

  "tagSuggestions": {
    "type": "tags",
    "tags": [
      "Kubernetes",
      "Docker",
      "DevOps",
      "Cloud Native"
    ]
  },

  "paragraphSuggestions": [
    {
      "type": "paragraph",
      "blockIndex": 3,
      "original": "...",
      "improved": "...",
      "reason": "..."
    }
  ]
}

BLOG TITLE

${title}

--------------------------

BLOG TAGS

${Array.isArray(tags) ? tags.join(", ") : tags}

--------------------------

BLOG CONTENT

${formattedBlocks}
`,

      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    console.log("2. Gemini Responded");

    const rawText = response.text;

    // Handles Gemini accidentally adding text before/after JSON
    const jsonStart = rawText.indexOf("{");
    const jsonEnd = rawText.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Gemini did not return valid JSON.");
    }

    const jsonString = rawText.substring(jsonStart, jsonEnd + 1);

    const polishedData = JSON.parse(jsonString);

    console.log("3. JSON Parsed Successfully");

    console.timeEnd("polish");

    return res.status(200).json(
      new Apiresponse(
        200,
        polishedData,
        "Polished data sent successfully"
      )
    );
  } catch (error) {
    console.error("========== POLISH ERROR ==========");
    console.error(error);
    console.error("==================================");

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const assetGenerator = Asynchandler(async (req, res) => {
  //changes
  const findpost = await Post.findById(postId);
  if (!findpost) {
    throw new Apierror(404, "post not found, create one ");
  }

  if (findpost.owner.toString() !== req.user._id.toString()) {
    throw new Apierror(401, "you are not authorize to use it ");
  }
  //changes
  const { content, postId } = req.body;

  if (!content) {
    throw new Apierror(400, "Content is required");
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new Apierror(404, "post not found, create one ");
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    throw new Apierror(401, "you are not authorize to use it");
  }
  //changes

  if (content.length > 30000) {
    throw new Apierror(400, "Content length is out of bound for free models");
  }

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",

    contents: `
    You are an expert social media manager and copywriter.

    Read the provided blog post and generate promotional assets to help the author share their work.

    Return ONLY valid JSON.
    Do not wrap the JSON in markdown or code fences.

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
}

    BlogPost:${content}`,
    config: {
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  });
  const text = response.text;
  const generatedAsset = JSON.parse(text);

  return res
    .status(200)
    .json(
      new Apiresponse(200, generatedAsset, "social media posts are generated"),
    );
});

export { polishDraft, simplifyText, assetGenerator, generateAiSummary };
