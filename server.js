const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so your GitHub Pages frontend can talk to this Render backend safely
app.use(cors());
app.use(express.json());

// Initialize the Gemini API client using your environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Clinical System Prompt to set Arthur's persona and scenario parameters
const SYSTEM_INSTRUCTION = `
You are Arthur, a 68-year-old male patient suffering from severe, worsening sepsis. 
You are currently confused, feeling incredibly cold, shivering, and short of breath. 
Keep your responses brief, realistic, and reflective of a critically ill patient. 
Do not break character or give medical explanations out of character.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { userMessage, patientState } = req.body;

        if (!userMessage) {
            return res.status(400).json({ error: "Missing userMessage in request body" });
        }

        // Use the recommended model for standard text simulation workflows
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_INSTRUCTION
        });

        // Contextualize the model with the current real-time physiological metrics from the frontend engine
        const contextualPrompt = `
[CURRENT PATIENT VITALS: HR: ${patientState?.hr || 115}, BP: ${patientState?.bpSys || 88}/${patientState?.bpDia || 50}, RR: ${patientState?.rr || 26}, SpO2: ${patientState?.spo2 || 92}%, Temp: ${patientState?.temp || 39.1}°C]
The paramedic says: "${userMessage}"
`;

        const result = await model.generateContent(contextualPrompt);
        const responseText = result.response.text().trim();

        res.json({ reply: responseText });

    } catch (error) {
        console.error("Error processing simulation chat routing:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Root check endpoint to easily test if the server is awake via browser click
app.get('/', (req, res) => {
    res.send("PulseSim AI Server is running and live.");
});

app.listen(PORT, () => {
    console.log(`PulseSim AI Server running smoothly on port ${PORT}`);
});
