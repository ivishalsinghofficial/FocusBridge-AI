import { renderTasks } from './tasks.js';

export function loadAIReflection() {
    chrome.storage.local.get(['history', 'userGoal'], (res) => {
        const aiText = document.getElementById('aiText');
        const today = new Date().toISOString().split('T')[0];
        const minsToday = (res.history || {})[today] || 0;
        const goal = res.userGoal || "your goals";

        const tips = [
            "Small steps lead to big miles.",
            "Consistency beats intensity every time.",
            "Don't forget to hydrate and blink!",
            "Deep work is a superpower. You're building it."
        ];

        let msg = `Buddy, you've put in ${minsToday} solid minutes into <strong>${goal}</strong> so far. `;
        if (minsToday === 0) msg = `The canvas is still blank for <strong>${goal}</strong>. 5 minutes is all it takes to start. `;

        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        aiText.innerHTML = msg + `<br><br><span style="color: #ffa500;">INFO: ${randomTip}</span>`;
        document.getElementById('coachTips').style.display = "block";
    });
}

function openMindfulOverlay(title, desc, showCircle = false) {
    const overlay = document.getElementById('mindfulOverlay');
    const circle = document.getElementById('breathingCircle');

    document.getElementById('mindfulTitle').innerText = title;
    document.getElementById('mindfulDesc').innerText = desc;

    overlay.style.display = 'flex';
    circle.style.display = showCircle ? 'block' : 'none';
    if (showCircle) circle.style.animation = "breathe 4s infinite ease-in-out";
    else circle.style.animation = "none";
}

export function initAICoach() {
    // 1. Breathing Exercise
    document.getElementById('struggleBtn').onclick = () => {
        openMindfulOverlay("Breathe In...", "Follow the circle. Calm your mind, buddy.", true);
        let isIn = true;
        window.breathInt = setInterval(() => {
            document.getElementById('mindfulTitle').innerText = isIn ? "Breathe Out..." : "Breathe In...";
            isIn = !isIn;
        }, 2000);
    };

    // 2. 5-4-3-2-1 Grounding
    document.getElementById('groundingBtn').onclick = () => {
        const steps = [
            "Identify 5 things you see around you.",
            "Identify 4 things you can touch right now.",
            "Identify 3 things you hear.",
            "Identify 2 things you can smell.",
            "Identify 1 thing you can taste."
        ];
        let currentStep = 0;
        openMindfulOverlay("Grounding", steps[0]);

        window.breathInt = setInterval(() => {
            currentStep++;
            if (currentStep < steps.length) {
                document.getElementById('mindfulDesc').innerText = steps[currentStep];
            } else {
                document.getElementById('mindfulTitle').innerText = "Steady Now";
                document.getElementById('mindfulDesc').innerText = "You are here. You are safe. Ready to return?";
                clearInterval(window.breathInt);
            }
        }, 4000);
    };

    // 3. Positive Affirmations
    document.getElementById('affirmationBtn').onclick = () => {
        const notes = [
            "I am capable of doing hard things.",
            "My progress is more important than my speed.",
            "I am in control of my time and my focus.",
            "I choose to be kind to myself while I work.",
            "One distraction does not define my whole day."
        ];
        const randomNote = notes[Math.floor(Math.random() * notes.length)];
        openMindfulOverlay("Daily Affirmation", randomNote);
    };

    // Close Overlay
    document.getElementById('closeMindfulBtn').onclick = () => {
        clearInterval(window.breathInt);
        document.getElementById('mindfulOverlay').style.display = 'none';
    };

    // 4. Goal Architect (Sub-tasks)
    document.getElementById('architectBtn').onclick = () => {
        chrome.storage.local.get(['userGoal', 'subTasks'], (res) => {
            if (!res.userGoal) return alert("Set a goal in the Focus tab first!");
            const goal = res.userGoal.toLowerCase();
            let suggestions = ["Analyze requirements", "Execute primary task", "Quality check"];
            if (goal.includes("code")) suggestions = ["Setup environment", "Write core logic", "Refactor code"];
            if (goal.includes("study") || goal.includes("learn")) suggestions = ["Skim material", "Detailed notes", "Self-quiz"];

            const currentTasks = res.subTasks || [];
            const newTasks = [...currentTasks];
            suggestions.forEach(s => {
                if (!currentTasks.some(t => t.text === s)) newTasks.push({ text: s, completed: false });
            });
            chrome.storage.local.set({ subTasks: newTasks }, () => {
                alert("Sub-tasks added!");
                renderTasks(newTasks); // Auto-update UI
            });
        });
    };
}
