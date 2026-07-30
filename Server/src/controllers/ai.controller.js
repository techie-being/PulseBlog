import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { client } from "../Config/ai.client.js";
import editorJsToText from "../utils/editorJsToText.js";
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
You are an expert technical educator and content summarizer.

Read the following blog post carefully and generate a concise, easy-to-understand summary that helps readers quickly grasp and remember the key ideas.

Requirements:
- Do NOT rewrite or improve the original article.
- Do NOT generate new content beyond what exists in the article.
- Keep the summary between 120-200 words.
- Focus only on the most important concepts.
- Write in clear, simple, professional language.
- Extract 4-8 key takeaways as short bullet points.
- Return ONLY valid JSON.
- Do NOT wrap the JSON in markdown or code fences.

Return JSON in exactly this format:

{
  "summary": "A concise summary of the article.",
  "keyTakeaways": [
    "...",
    "...",
    "...",
    "...",
    "..."
  ]
}

Blog Content:
${content}
`,
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

  const formattedBlocks = editorJsToText(content);
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

    return res
      .status(200)
      .json(
        new Apiresponse(200, polishedData, "Polished data sent successfully"),
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
  // CHANGE 1: Receive only postId. We'll fetch the latest post from the database.
  const { postId } = req.body;

  if (!postId) {
    throw new Apierror(400, "Post id is required");
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new Apierror(404, "Post not found");
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    throw new Apierror(401, "You are not authorized to use this feature");
  }

  // Extract latest title, tags and content from the database
  const { title, tags, content } = post;

  //  Convert EditorJS blocks into readable plain text

  const formattedBlocks = editorJsToText(content);
  // CHANGE 4: Check actual content length instead of content.length

  if (formattedBlocks.length > 30000) {
    throw new Apierror(400, "Content length exceeds free Gemini model limit");
  }

  console.time("asset-generator");
  console.log("1. Asset generation started");

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",

    contents: `
You are an expert content marketing strategist.

Read the blog and generate promotional assets for multiple platforms.

Return ONLY valid JSON.

Do NOT use markdown.

Do NOT wrap JSON inside code fences.

Always generate all fields.

Return JSON exactly like this:

{
  "linkedin": {
    "post": "...",
    "hashtags": [
      "#AI",
      "#Programming"
    ]
  },

  "twitter": {
  "tweet": "A single professional tweet under 300 characters.",
  "hashtags": [
    "#Kubernetes",
    "#DevOps"
  ]
}

  "instagram": {
    "caption": "...",
    "hashtags": [
      "#AI",
      "#Developer"
    ]
  },

  "youtube": {
    "title": "...",
    "description": "...",
    "hashtags": [
      "#AI",
      "#Programming"
    ]
  },

  "seo": {
    "metaTitle": "...",
    "metaDescription": "...",
    "keywords": [
      "...",
      "...",
      "..."
    ],
    "slug": "..."
  },

  "hooks": [
    "...",
    "...",
    "..."
  ]
}

BLOG TITLE

${title}

--------------------------------

BLOG TAGS

${Array.isArray(tags) ? tags.join(", ") : tags}

--------------------------------

BLOG CONTENT

${formattedBlocks}
`,

    config: {
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  });

  console.log("2. Gemini responded");

  // Parse Gemini response
  const generatedAssets = JSON.parse(response.text);

  console.log("3. JSON parsed");
  console.timeEnd("asset-generator");

  return res
    .status(200)
    .json(
      new Apiresponse(
        200,
        generatedAssets,
        "Social media assets generated successfully",
      ),
    );
});

export { polishDraft, simplifyText, assetGenerator, generateAiSummary };
