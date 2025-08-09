import express from 'express';
import multer from 'multer';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

// Configure multer for file uploads
const upload = multer({
    dest: path.join(projectRoot, 'uploads/'),
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

// Serve static files from public directory
app.use(express.static(path.join(projectRoot, 'public')));
app.use('/assets', express.static(path.join(projectRoot, 'assets')));

// Route for main page
app.get('/', (req, res) => {
    res.sendFile(path.join(projectRoot, 'public', 'screens', 'index.html'));
});

// Routes for other pages
app.get('/auth', (req, res) => {
    res.sendFile(path.join(projectRoot, 'public', 'screens', 'auth.html'));
});

app.get('/docs', (req, res) => {
    res.sendFile(path.join(projectRoot, 'public', 'screens', 'docs.html'));
});

app.get('/how-it-works', (req, res) => {
    res.sendFile(path.join(projectRoot, 'public', 'screens', 'how-it-works.html'));
});

// API endpoint for image analysis
app.post('/api/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        if (!req.body.prompt) {
            return res.status(400).json({ error: 'No prompt provided' });
        }

        // Read the uploaded image file
        const imageBuffer = fs.readFileSync(req.file.path);
        
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

        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);

        // Send the response back to the frontend
        res.json({ result: response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});