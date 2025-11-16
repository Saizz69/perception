// =========================================================
// 1. Configuration (REPLACE YOUR KEY HERE)
// =========================================================
// !!! WARNING: NEVER EXPOSE YOUR KEY IN A PUBLIC FRONTEND !!!
const GEMINI_API_KEY = "AIzaSyAhR8G4eGLhWxYBY68LYgre0h6pt1Q3fgw"; // <-- REPLACE THIS
const MODEL_NAME = "gemini-2.5-flash"; // A fast, capable model
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;


// =========================================================
// 2. Core API Call Function
// =========================================================
async function getGeminiResponse(userQuery) {
    if (!userQuery.trim()) {
        return "Please enter a question first.";
    }

    const requestBody = {
        contents: [{
            role: "user",
            parts: [{ text: userQuery }]
        }]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            // Handle HTTP errors (e.g., 400, 403, 500)
            const errorData = await response.json();
            console.error("API Error Response:", errorData);
            return `Error: Failed to connect to Gemini. Status: ${response.status}. Check console for details.`;
        }

        const data = await response.json();
        
        // The AI's response text is usually nested in the response structure
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return text || "AI returned an empty response.";

    } catch (error) {
        console.error("Network or API call failed:", error);
        return "A network error occurred. Please check your connection or CORS settings.";
    }
}


// =========================================================
// 3. Frontend Connection (Button Logic)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const askButton = document.getElementById('ask-ai-button');
    const inputElement = document.getElementById('user-input');
    const responseText = document.getElementById('ai-response-text');

    askButton.addEventListener('click', async () => {
        const query = inputElement.value;
        
        // Set loading state and disable input/button
        responseText.textContent = '...Thinking...';
        askButton.disabled = true;
        inputElement.disabled = true;

        // Get the response
        const result = await getGeminiResponse(query);

        // Update UI with the result and reset state
        responseText.textContent = result;
        askButton.disabled = false;
        inputElement.disabled = false;
    });
});
