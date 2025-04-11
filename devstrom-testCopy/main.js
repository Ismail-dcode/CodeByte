import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
dotenv.config();

// Check if API key exists
if (!process.env.API_KEY) {
  console.error("Error: API_KEY not found in environment variables");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Check if image file exists
if (!fs.existsSync("cookie.jpeg")) {
  console.error("Error: cookie.jpeg file not found");
  process.exit(1);
}

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "analyze this image and build the frontend in react native";
const image = {
  inlineData: {
    data: Buffer.from(fs.readFileSync("test-img.jpg")).toString("base64"),
    mimeType: "image/jpg",
  },
};

try {
  const result = await model.generateContent([prompt, image]);
  console.log(result.response.text());
} catch (error) {
  console.error("Error:", error.message);
}