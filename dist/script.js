// =========================================================
// 1. Configuration (REPLACE YOUR KEY HERE)
// =========================================================
// !!! WARNING: NEVER EXPOSE YOUR KEY IN A PUBLIC FRONTEND !!!
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // <-- REPLACE THIS with your key
const MODEL_NAME = "gemini-2.5-flash";
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
            // Log the error response for debugging
            const errorData = await response.json();
            console.error("API Error Response:", errorData);
            return `Error: Failed to connect to Gemini. Status: ${response.status}. Check console for error details.`;
        }

        const data = await response.json();
        
        // Extract the AI's response text
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
    // 1. Get the elements by their IDs (MUST MATCH HTML)
    const askButton = document.getElementById('ask-ai-button');
    const inputElement = document.getElementById('user-input');
    const responseText = document.getElementById('ai-response-text');

    if (!askButton || !inputElement || !responseText) {
        console.error("Initialization Error: One or more HTML elements were not found. Check your IDs.");
        return; // Stop execution if elements are missing
    }

    // 2. Attach the click listener
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
