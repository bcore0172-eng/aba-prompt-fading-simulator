// ===== DOM ELEMENTS =====
const promptElement = document.getElementById("prompt");
const fadeBtn = document.getElementById("fadeBtn");
const resetBtn = document.getElementById("resetBtn");
const exportBtn = document.getElementById("exportBtn");

const trialCountElement = document.getElementById("trialCount");
const promptLevelElement = document.getElementById("promptLevel");
const timerElement = document.getElementById("timer");
const masteryElement = document.getElementById("mastery");
const promptSelect = document.getElementById("promptSelect");

// ===== PROMPT DATA =====
const promptLevels = ["Do this action now", "Do the action", "Action"];
const promptNames = ["Full Verbal", "Partial Verbal", "Gestural"];

const promptColors = {
    "Full Verbal": "black",
    "Partial Verbal": "darkblue",
    "Gestural": "orange",
    "Independent": "green"
};

// ===== STATE VARIABLES =====
let currentLevel = 0;
let trial = 0;
let fadeLevel = 1.0;

const fadeStep = 0.2;
const minOpacity = 0.2;

let sessionData = [];

let timer = 0;
let timerInterval = null;

let masteryCount = 0;
const masteryGoal = 3;

// ===== TIMER FUNCTIONS =====
function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            timer++;
            timerElement.textContent = `Timer: ${timer}s`;
        }, 1000);
    }
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// ===== FADE BUTTON =====
fadeBtn.addEventListener("click", () => {
    startTimer(); // timer now continues across trials

    const selectedPrompt = promptSelect.value;

    // Only fade text if not Independent
    if (selectedPrompt !== "Independent") {
        if (currentLevel < promptLevels.length - 1) {
            currentLevel++;
            promptElement.textContent = promptLevels[currentLevel];
            promptLevelElement.textContent =
                "Prompt Level: " + promptNames[currentLevel];
        }

        if (fadeLevel > minOpacity) {
            fadeLevel -= fadeStep;
            promptElement.style.opacity = fadeLevel;
        }
    } else {
        // For Independent, full fade and level
        promptElement.style.opacity = 1;
        promptElement.textContent = "Action";
        promptLevelElement.textContent = "Prompt Level: Independent";
    }

    // Update trial count
    trial++;
    trialCountElement.textContent = "Trial: " + trial;

    // Apply color
    promptElement.style.color = promptColors[selectedPrompt];

    // Mastery tracking
    if (selectedPrompt === "Independent") {
        masteryCount++;
    } else {
        masteryCount = 0;
    }

    if (masteryCount >= masteryGoal) {
        masteryElement.classList.add("green");
        masteryElement.textContent = `Mastery achieved! ${masteryCount} / ${masteryGoal}`;
        fadeBtn.disabled = true; // disable fade button at mastery
    } else {
        masteryElement.classList.remove("green");
        masteryElement.textContent = `Mastery: ${masteryCount} / ${masteryGoal} independent trials`;
        fadeBtn.disabled = false;
    }

    // Save session data
    sessionData.push({
        Trial: trial,
        "Prompt Type": selectedPrompt,
        "Prompt Level": selectedPrompt === "Independent" ? "Independent" : promptNames[currentLevel],
        "Fade Level": fadeLevel.toFixed(2),
        Duration: timer + "s",
        Time: new Date().toLocaleTimeString()
    });
});

// ===== RESET BUTTON =====
resetBtn.addEventListener("click", () => {
    currentLevel = 0;
    trial = 0;
    fadeLevel = 1.0;
    masteryCount = 0;
    timer = 0;

    promptElement.textContent = promptLevels[0];
    promptElement.style.opacity = fadeLevel;
    promptElement.style.color = "black";

    trialCountElement.textContent = "Trial: 0";
    promptLevelElement.textContent = "Prompt Level: Full Verbal";
    masteryElement.textContent = `Mastery: 0 / ${masteryGoal} independent trials`;
    masteryElement.classList.remove("green");

    timerElement.textContent = "Timer: 0s";
    fadeBtn.disabled = false;
    sessionData = [];

    stopTimer();
});

// ===== EXPORT CSV =====
exportBtn.addEventListener("click", () => {
    if (sessionData.length === 0) {
        alert("No session data to export.");
        return;
    }
    // Quote and escape CSV values to handle commas and quotes
    const csvEscape = (val) => {
        const s = String(val === null || val === undefined ? "" : val);
        return '"' + s.replace(/"/g, '""') + '"';
    };

    const headers = Object.keys(sessionData[0]).map(csvEscape).join(",");
    const rows = sessionData.map(row =>
        Object.values(row).map(csvEscape).join(",")
    );

    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "aba_prompt_fading_session.csv";
    a.click();

    URL.revokeObjectURL(url);
});
