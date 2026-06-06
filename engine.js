// --- STATE MANAGEMENT ---
let timeRemaining = 600; // 10 minutes in seconds
let timerInterval;
let physiologyInterval;

let patient = {
    hr: 115,
    bpSys: 88,
    bpDia: 50,
    rr: 26,
    spo2: 92,
    temp: 39.1,
    bm: null,
    isDeteriorating: true,
    interventions: []
};

// --- DOM ELEMENTS ---
const elTimer = document.getElementById('timer-display');
const elChatFeed = document.getElementById('chat-feed');
const elChatInput = document.getElementById('chat-input');
const elBtnSend = document.getElementById('btn-send');
const interventionBtns = document.querySelectorAll('.intervention-btn');
const btnEnd = document.getElementById('btn-end');

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
    updateVitalsUI();
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

if (btnEnd) {
    btnEnd.addEventListener('click', () => {
        clearInterval(timerInterval);
        clearInterval(physiologyInterval);
        addChatSystemMessage("Scenario ended early. Commencing Handover.");
    });
}

// --- PHYSIOLOGY ENGINE ---
function startPhysiologyEngine() {
    physiologyInterval = setInterval(() => {
        if (patient.isDeteriorating) {
            patient.bpSys -= Math.floor(Math.random() * 3) + 1;
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
    if (patient.interventions.includes(action)) {
        addChatSystemMessage(`You already performed: ${label}`);
        return;
    }
    
    patient.interventions.push(action);
    addChatSystemMessage(`Action Performed: ${label}`);

    if (action === 'oxygen') {
        patient.spo2 = 99;
    } 
    else if (action === 'fluids') {
        patient.bpSys += 15;
        patient.hr -= 10;
        patient.isDeteriorating = false; 
    }
    else if (action === 'bm-check') {
        patient.bm = 6.2;
    }

    updateVitalsUI();
}

function updateVitalsUI() {
    elVitalHR.textContent = patient.hr;
    patient.bpDia = Math.floor(patient.bpSys * 0.6);
    elVitalBP.textContent = `${patient.bpSys}/${patient.bpDia}`;
    elVitalSpO2.textContent = patient.spo2;
    elVitalRR.textContent = patient.rr;
    elVitalTemp.textContent = patient.temp;
    elVitalBM.textContent = patient.bm ? patient.bm : '---';

    if (patient.bpSys < 80 || patient.hr > 130 || patient.spo2 < 90) {
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

    appendMessage('paramedic', text);
    elChatInput.value = '';
    generateAIResponse(text);
}

async function generateAIResponse(userText) {
    try {
        appendMessage('patient', '...'); 
        
        // Changed destination to Render Cloud Endpoint
        const response = await fetch('https://pulse-sim.onrender.com/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userMessage: userText, patientState: patient })
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        elChatFeed.lastChild.remove(); 
        appendMessage('patient', data.reply);

    } catch (error) {
        elChatFeed.lastChild.remove();
        appendMessage('patient', '*No response...* (Is the server running?)');
        console.error("Connection failed:", error);
    }
}

function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    const isParamedic = sender === 'paramedic';
    msgDiv.className = `max-w-[80%] p-3 rounded-lg ${isParamedic ? 'bg-nias-green text-white self-end rounded-br-none' : 'bg-slate-600 text-slate-100 self-start rounded-bl-none'}`;
    msgDiv.innerHTML = `<span class="block text-xs font-bold mb-1 opacity-70">${isParamedic ? 'You (Paramedic)' : 'Patient'}</span>${text}`;
    elChatFeed.appendChild(msgDiv);
    elChatFeed.scrollTop = elChatFeed.scrollHeight;
}

// System alerts inside chat box
function addChatSystemMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'w-full text-center text-nias-yellow text-xs font-mono my-2';
    msgDiv.innerText = `[ ${text} ]`;
    elChatFeed.appendChild(msgDiv);
    elChatFeed.scrollTop = elChatFeed.scrollHeight;
}

initScenario();
