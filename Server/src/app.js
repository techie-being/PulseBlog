import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";


import express from "express";
import multer from "multer";
import "./Config/Passport.js";

const app = express();

// Essential for Rate Limiting to work on Render/Vercel
app.set("trust proxy", 1);

//to clean cookie string in to a clean object
app.use(cookieParser());

//for valid request access only pulseblog frontend can talk to this
// Backend app.js
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"] // Add this!
}));

//secure https header
app.use(helmet({ contentSecurityPolicy: false }));

//configure server to accept data up to 16kb
app.use(express.json({ limit: "16kb" }));

//configure server to clean garbage value from url convert in to req.body
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//configure server to check public folder before complex db query
app.use(express.static("public"));

//Router initialization

import { router as userRouter } from "./routes/user.routes.js";
import { router as postRouter } from "./routes/post.routes.js";
import { router as subcriptionRouter } from "./routes/subscribe.routes.js";
import { router as likeRouter } from "./routes/like.routes.js";
import { router as commentRouter } from "./routes/comment.routes.js";
import { router as shareRouter } from "./routes/share.routes.js";
import { router as aiRouter } from "./routes/ai.routes.js";

import {standardRateLimit,aiRateLimit} from "./middlewares/rateLimit.js";
 

//user routes
app.use("/api/v1/users",standardRateLimit,  userRouter);

//post routes
app.use("/api/v1/posts", standardRateLimit, postRouter);

//Subscription routes

app.use("/api/v1/subcription", standardRateLimit, subcriptionRouter);

//like routes

app.use("/api/v1/like", standardRateLimit,likeRouter);

app.use("/api/v1/comment", standardRateLimit,commentRouter);

app.use("/api/v1/share",standardRateLimit, shareRouter);

app.use("/api/v1/ai", aiRateLimit, aiRouter);

app.use((err, req, res, next) => {
  // Log the actual error for the developer to see in the terminal
  console.error("--- SERVER ERROR LOG ---");
  console.error(err);
  console.error("-------------------------");

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  }

  // Send a clean message to the frontend
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });

  //new add
  
});
export { app };
