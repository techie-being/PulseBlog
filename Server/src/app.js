import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from 'helmet';
import {rateLimit} from "express-rate-limit"
import express from 'express';

const app = express()

//global multer error handler

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Multer error: ${err.message}` });
    }
    res.status(500).json({ message: err.message });
});

// Essential for Rate Limiting to work on Render/Vercel
app.set('trust proxy', 1);

//to clean cookie string in to a clean object
app.use(cookieParser())

//for valid request access only pulseblog frontend can talk to this
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true, 
}));

//secure https header
app.use(helmet(
    {contentSecurityPolicy: false,}
));

//for normal request like posts fetch or profile details etc,
const standardRateLimit = rateLimit(
    {
        windowMs:15*60*1000,
        max:100,
        message:{success: false, message: 'Too many requests, please try again later.'}
    }
)

const aiRateLimit = rateLimit(
    {
        windowMs:60*60*1000,
        max:5,
        message:{success: false, message: 'AI generation limit reached. Please try again in an hour.'}
    }
);

const authRateLimit = rateLimit(
    {
        windowMs:15*60*1000,
        max:10,
        message: { success: false, message: 'Too many login attempts, please try again later.' }
    }
);

//configure server to accept data up to 16kb
app.use(express.json({limit:"16kb"}));

//configure server to clean garbage value from url convert in to req.body
app.use(express.urlencoded({extended:true,limit:"16kb"}));

//configure server to check public folder before complex db query
app.use(express.static("public"));

//Router initialization

import {router as userRouter} from "./routes/user.routes.js"
import {router as postRouter} from "./routes/post.routes.js"
import {router as subcriptionRouter} from "./routes/subscribe.routes.js"
import {router as likeRouter} from "./routes/like.routes.js"
import {router as commentRouter} from "./routes/comment.routes.js"
import {router as shareRouter} from "./routes/share.routes.js"
import {router as aiRouter} from "./routes/ai.routes.js"

//user routes
app.use("/api/v1/users",standardRateLimit,userRouter)

//post routes
app.use("/api/v1/posts",standardRateLimit,postRouter)

//Subscription routes

app.use("/api/v1/subcription",standardRateLimit,subcriptionRouter)

//like routes

app.use("/api/v1/like",standardRateLimit,likeRouter)

app.use("/api/v1/comment",commentRouter)

app.use("/api/v1/share",shareRouter)

app.use("/api/v1/like",aiRateLimit,aiRouter)

export {app}
