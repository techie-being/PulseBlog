import { InferenceClient } from "@huggingface/inference";
import {Apierror} from "../utils/Apierror.js"
const client = new InferenceClient(process.env.HF_TOKEN) ;

try {
   const generateEmbedding = async (text)=>{
    
    if(!text){
      return null;
    }

    const output = await client.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2", 
      inputs: text,
    });

    return Array.isArray(output) ? output.flat() : output;
   }  
} 
catch (error) {
    console.error("Hugging Face Embedding Error:", error);
    throw new Apierror(404,"vector embedding is not generated")
}

export {generateEmbedding}