# 🚑 PulseSim: Paramedic Simulation Engine

PulseSim is an AI-driven simulation engine for paramedics. It offers real-time physiological modeling where a patient's vitals and condition dynamically evolve based on user treatments or delays. Practice history-taking, ABCDE assessments, and critical interventions across multiple medical and trauma scenarios to master pre-hospital emergency care.

## 🌟 Features
* **Dynamic Physiology Engine:** Patient vitals degrade over time if critical interventions are missed.
* **Responsive AI Patient:** Powered by an LLM, the patient responds in real-time, altering their speech patterns based on their hidden vital signs (e.g., hypoxia causes confusion).
* **Clinical Friction:** Forces the user to prioritize ABCDE algorithms over immediate history-taking.
* **NIAS UI:** Styled using the Northern Ireland Ambulance Service clinical color palette (Dark Emerald & Battenburg Yellow).

## 🛠️ Tech Stack
* **Frontend:** HTML5, Vanilla JavaScript, Tailwind CSS.
* **Backend:** Node.js, Express.
* **AI Integration:** Google Gemini API.

## 🚀 How to Run Locally

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/yourusername/pulse-sim.git
   cd pulse-sim
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up API Keys:**
   Create a \`.env\` file in the root directory and add your Google Gemini API key:
   \`\`\`env
   GEMINI_API_KEY=your_api_key_here
   \`\`\`

4. **Start the simulation:**
   \`\`\`bash
   npm start
   \`\`\`
   Then, simply double-click \`index.html\` to open the dashboard in your browser.
