import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const { userMessage, patientState } = req.body;

        const systemPrompt = `
You are Arthur, a 68-year-old male patient. You have no medical training.
You are currently experiencing an uncompensated sepsis episode secondary to a UTI.
Current location: Your living room sofa.

CURRENT PATIENT VITALS (Hidden from you, but you feel their effects):
- Heart Rate: ${patientState.hr}
- Blood Pressure: ${patientState.bpSys}/${patientState.bpDia}
- SpO2: ${patientState.spo2}%
- Temp: ${patientState.temp}°C

RULES:
1. DO NOT use medical jargon. Do not diagnose yourself.
2. Keep answers to 1-2 short sentences. You are tired and breathless.
3. If asked about pain, you have mild lower back pain and burning when urinating for 3 days.
4. If HR > 130 or SpO2 < 85%, act confused, frightened, and struggle to form full sentences.
5. React dynamically to treatments (e.g., if fluids were given and BP rises, say you feel a tiny bit less dizzy).
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent([
            systemPrompt,
            `Paramedic says: "${userMessage}"\nRespond in character:`
        ]);
        
        const responseText = result.response.text();
        res.json({ reply: responseText });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ reply: "*Groans...* (Patient is unresponsive or connection failed)" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`PulseSim AI Server running on http://localhost:${PORT}`));
