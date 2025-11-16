// server.js

// 1. Import necessary modules
const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch'); // Used for making HTTP requests

// 2. Load environment variables from .env file
dotenv.config();

// 3. Configuration
const app = express();
const PORT = 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

// 4. Middleware: Parse incoming JSON requests
app.use(express.json());

// 5. Middleware: Serve your static HTML/JS files (assuming they are in a 'public' folder)
// Create a 'public' folder and put your index.html and script.js inside it.
app.use(express.static('public')); 

// =========================================================
// 6. The Secure Proxy Endpoint (Matches PROXY_API_URL in script.js)
// =========================================================
app.post('/api/generate', async (req, res) => {
    // A. Check for API Key
    if (!GEMINI_API_KEY) {
        console.error("API Key not loaded!");
        return res.status(500).json({ error: "Server configuration error: API Key missing." });
    }

    // B. Get user query from the frontend request body
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: "Missing 'query' parameter." });
    }

    // C. Construct the request body for Gemini API
    const requestBody = {
        contents: [{
            role: "user",
            parts: [{ text: query }]
        }]
    };

    try {
        // D. Make the secure call to the Gemini API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
            // Forward error from Gemini to the client
            console.error("Gemini API Error:", data);
            return res.status(response.status).json({ error: data.error?.message || "Gemini API call failed." });
        }

        // E. Extract the result and send it back to the frontend
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        // Respond to the frontend (script.js) with the result
        res.json({ text: text || "AI returned an empty response." });

    } catch (error) {
        console.error("Proxy Network Error:", error);
        res.status(500).json({ error: "Internal server error during API communication." });
    }
});

// 7. Start the Server
app.listen(PORT, () => {
    console.log(`\n✅ Server running securely! Access at http://localhost:${PORT}`);
    console.log("-----------------------------------------------------------------");
    console.log(`API Key Status: ${GEMINI_API_KEY ? '✅ Loaded successfully' : '❌ NOT LOADED!'}`);
    console.log(`Frontend files served from the '/public' directory.`);
});
