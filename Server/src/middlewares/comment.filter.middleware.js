import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { client } from "../Config/ai.client.js";

//run before create post
const blockToxicity = Asynchandler(async (req, res, next) => {
  const { commentText } = req.body;

  if (!commentText) {
    throw new Apierror(400, "Empty comment is not allowed");
  }

  const response = await client.models.generateContent({
  model: "gemini-2.5-flash-lite",

  contents: `
    You are a strict, impartial community moderator for a blog.

    Analyze the provided user comment.

    Determine whether the comment contains:
    - Hate speech
    - Severe profanity
    - Harassment
    - Blatant spam or bot behavior

    Do NOT mark constructive criticism, disagreement, or polite negative feedback as toxic.
    Return ONLY valid JSON.
    Do not wrap the JSON in markdown or code fences.
{
  "isToxic": true,
  "reason": "If toxic, provide a one-sentence explanation. Otherwise use null."
}

  User Comment:${commentText}`,

  config: {
    temperature: 0.2,
    responseMimeType: "application/json",
  },
});
  const text = response.text;
  const analyzedComment = JSON.parse(text);

  // 2. Block if toxic
  if (analyzedComment.isToxic === true) {
    throw new Apierror(403, `Comment blocked: ${analyzedComment.reason}`);
  }

  next();
});

export { blockToxicity };
