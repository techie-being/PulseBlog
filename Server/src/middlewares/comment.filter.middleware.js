import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { client } from "../Config/ai.client.js";

//run before create post
const blockToxicity = Asynchandler(async (req, res, next) => {
  const { commentText } = req.body;

  if (!commentText) {
    throw new Apierror(400, "Empty comment is not allowed");
  }

  // 1. Send to AI
  const response = await client.chat.completions.create({
    model: "Phi-4",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
        You are a strict, impartial community moderator for a blog. Analyze the provided user comment. 
        Your job is to determine if the comment contains hate speech, severe profanity, harassment, or blatant spam/bot behavior. Disagreement or constructive criticism is NOT toxic.
        You MUST return a valid JSON object in this exact format:
        {
          "isToxic": true or false,
          "reason": "If toxic, provide a 1-sentence explanation. If false, output null."
        }
        `
      },
      {
        role: "user",
        content: `Here is the user comment to analyze: ${commentText}`,
      },
    ],
    temperature: 0.2,
  });

  const analyzedComment = JSON.parse(response.choices[0].message.content);

  // 2. Block if toxic
  if (analyzedComment.isToxic === true) {
    throw new Apierror(403, `Comment blocked: ${analyzedComment.reason}`);
  }

  next();
});

export { blockToxicity };
