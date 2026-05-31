// --- STATE MANAGEMENT ---
let timeRemaining = 600; // 10 minutes in seconds
let timerInterval;
let physiologyInterval;

// The Dynamic State Model
let patient = {
    hr: 115,
    bpSys: 88,
    bpDia: 50,
    rr: 26,
    spo2: 92,
    temp: 39.1,
    bm: null, // Untested initially
    isDeteriorating: true,
    interventions: []
};

// --- DOM ELEMENTS ---
const elTimer = document.getElementById('timer-display');
const elChatFeed = document.getElementById('chat-feed');
const elChatInput = document.getElementById('chat-input');
const elBtnSend = document.getElementById('btn-send');
const interventionBtns = document.querySelectorAll('.intervention-btn');

// Vitals Elements
const elVitalHR = document.getElementById('vital-hr');
const elVitalBP = document.getElementById('vital-bp');
const elVitalSpO2 = document.getElementById('vital-spo2');
const elVitalRR = document.getElementById('vital-rr');
const elVitalTemp = document.getElementById('vital-temp');
const elVitalBM = document.getElementById('vital-bm');

// --- INITIALIZATION ---
function initScenario() {
    startTimer();
    startPhysiologyEngine();
    addChatSystemMessage("Scenario Started. You have 10 minutes to assess and stabilize the patient.");
}

// --- TIMER LOGIC ---
function startTimer() {
    timerInterval = setInterval(() => {
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            clearInterval(physiologyInterval);
            addChatSystemMessage("Time is up. Scenario ended.");
            return;
        }
        timeRemaining--;
        let minutes = Math.floor(timeRemaining / 60);
        let seconds = timeRemaining % 60;
        elTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// --- PHYSIOLOGY ENGINE ---
function startPhysiologyEngine() {
    // Every 30 seconds, vitals shift based on condition and treatments
    physiologyInterval = setInterval(() => {
        if (patient.isDeteriorating) {
            // Uncompensated Sepsis Deterioration Logic
            patient.bpSys -= Math.floor(Math.random() * 3);
            patient.hr += Math.floor(Math.random() * 4);
            patient.rr += 1;
            patient.spo2 -= 1;
        }
        updateVitalsUI();
    }, 30000);
}

// --- INTERVENTIONS ---
interventionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        handleIntervention(action, e.target.innerText);
    });
});

function handleIntervention(action, label) {
    if (patient.interventions.includes(action)) return; // Prevent spamming
    
    patient.interventions.push(action);
    addChatSystemMessage(`Action Performed: ${label}`);

    // Apply physiological modifiers
    if (action === 'oxygen') {
        patient.spo2 = 99; // Fix hypoxia
    } 
    else if (action === 'fluids') {
        patient.bpSys += 15; // Fluid bolus raises BP
        patient.hr -= 10;    // HR drops as BP stabilizes
        patient.isDeteriorating = false; // Stabilized for now
    }
    else if (action === 'bm-check') {
        patient.bm = 6.2;
    }

    updateVitalsUI();
}

function updateVitalsUI() {
    elVitalHR.textContent = patient.hr;
    elVitalBP.textContent = `${patient.bpSys}/${Math.floor(patient.bpSys * 0.6)}`; // Fake Diastolic for demo
    elVitalSpO2.textContent = patient.spo2;
    elVitalRR.textContent = patient.rr;
    elVitalTemp.textContent = patient.temp;
    elVitalBM.textContent = patient.bm ? patient.bm : '---';

    // Flash red if critical
    if (patient.bpSys < 60 || patient.hr > 150) {
        elVitalHR.parentElement.classList.add('animate-pulse', 'bg-red-900');
    } else {
        elVitalHR.parentElement.classList.remove('animate-pulse', 'bg-red-900');
    }
}

// --- CHAT INTERFACE ---
elBtnSend.addEventListener('click', handleUserChat);
elChatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserChat();
});

function handleUserChat() {
    const text = elChatInput.value.trim();
    if (!text) return;

    // 1. Add user message to UI
    appendMessage('paramedic', text);
    elChatInput.value = '';

    // 2. Send to AI (Placeholder for API fetch)
    // Here you will pass `text` and `patient` object to your AI endpoint
    setTimeout(() => {
        generateAIResponse(text);
    }, 1000);
}

function generateAIResponse(userText) {
    // MOCK AI RESPONSE - Replace with actual fetch to OpenAI/Gemini
    let response = "I don't feel well... I'm so cold but sweating.";
    if (userText.toLowerCase().includes('pain')) {
        response = "My stomach hurts a bit, but mostly I just feel weak.";
    }
    appendMessage('patient', response);
}

function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    const isParamedic = sender === 'paramedic';
    
    msgDiv.className = `max-w-[80%] p-3 rounded-lg ${isParamedic ? 'bg-nias-green text-white self-end rounded-br-none' : 'bg-slate-600 text-slate-100 self-start rounded-bl-none'}`;
    
    msgDiv.innerHTML = `<span class="block text-xs font-bold mb-1 opacity-70">${isParamedic ? 'You (Paramedic)' : 'Patient'}</span>${text}`;
    
    elChatFeed.appendChild(msgDiv);
    elChatFeed.scrollTop = elChatFeed.scrollHeight;
}

function addChatSystemMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'w-full text-center text-nias-yellow text-xs font-mono my-2';
    msgDiv.innerText = `[ ${text} ]`;
    elChatFeed.appendChild(msgDiv);
    elChatFeed.scrollTop = elChatFeed.scrollHeight;
}

// Start app
initScenario();
