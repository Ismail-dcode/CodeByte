import multer from 'multer';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configure multer for memory storage
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

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Helper function to run multer middleware
const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check if API key exists
        if (!process.env.API_KEY) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Process the file upload
        await runMiddleware(req, res, upload.single('image'));

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
}
