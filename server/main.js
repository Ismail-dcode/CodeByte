import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Configure multer for memory storage (no file system operations)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Check if API key exists
if (!process.env.API_KEY) {
    console.error("Error: API_KEY not found in environment variables");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// API endpoint for image analysis
app.post('/api/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        if (!req.body.prompt) {
            return res.status(400).json({ error: 'No prompt provided' });
        }

        // Use the image buffer directly from memory
        const imageBuffer = req.file.buffer;
        
        // Prepare the image for Gemini API
        const image = {
            inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType: req.file.mimetype,
            },
        };

        // Generate content using Gemini API
        const result = await model.generateContent([req.body.prompt, image]);
        const response = result.response.text();

        // Send the response back to the frontend
        res.json({ result: response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Export for Vercel serverless functions
export default app;