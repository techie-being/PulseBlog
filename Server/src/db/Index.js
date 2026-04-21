import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { Post } from "../models/post.models.js"; // 1. Import the Post model

const connectDb = async () => {
    try {
        const URL = process.env.MONGO_URL;
        const connectionInstance = await mongoose.connect(URL);
        
        console.log("Database successfully connected");

        // 2. RUN THE FIX HERE (After successful connection)
        console.log("Syncing comment counts...");
        
        await Post.updateMany(
            { commentCount: { $eq: null } }, 
            { $set: { commentCount: 0 } } 
        );

        await Post.updateMany(
            { commentCount: { $exists: false } }, 
            { $set: { commentCount: 0 } }
        );

        console.log("Database data sanitized successfully ✅");

    } catch (error) {
        console.log(error, "❌ MONGODB CONNECTION ERROR:");
        process.exit(1);
    }
}

export { connectDb };