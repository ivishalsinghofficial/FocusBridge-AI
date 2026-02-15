import { fireConfetti } from './confetti.js';

export function initPomodoro() {
    // ... existing setup ...
    // Start Pomodoro
    document.getElementById('startPomoBtn').onclick = () => {
        const mins = parseInt(document.getElementById('pomoMins').value);
        chrome.runtime.sendMessage({ action: "startPomo", minutes: mins });
        const end = Date.now() + (mins * 60000);
        // FIX: Set workDuration here too so content script sees it immediately
        chrome.storage.local.set({
            pomoActive: true,
            pomoEndTime: end,
            workDuration: mins,
            pomoMilestones: [] // Reset milestones
        });
        document.getElementById('pomo-setup').style.display = 'none';
        document.getElementById('pomo-active').style.display = 'flex';
    };

    document.getElementById('stopPomoBtn').onclick = () => {
        chrome.alarms.clearAll();
        chrome.storage.local.set({ pomoActive: false, pomoMilestones: [] });
        document.getElementById('pomo-setup').style.display = 'block';
        document.getElementById('pomo-active').style.display = 'none';
    };

    // Check state on load
    chrome.storage.local.get(['pomoActive', 'pomoEndTime', 'workDuration'], (res) => {
        if (res.pomoActive) {
            const remaining = Math.max(0, res.pomoEndTime - Date.now());
            const m = Math.floor(remaining / 60000); const s = Math.floor((remaining % 60000) / 1000);
            document.getElementById('timerOutput').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
            document.getElementById('pomo-setup').style.display = 'none';
            document.getElementById('pomo-active').style.display = 'flex';
        }
    });

    // Timer tick
    setInterval(async () => {
        const res = await chrome.storage.local.get(['pomoActive', 'pomoEndTime', 'workDuration', 'pomoMilestones']);
        if (!res.pomoActive) return;

        const now = Date.now();
        const rem = res.pomoEndTime - now;

        // 1. Check for Completion (100%)
        if (rem <= 0) {
            chrome.storage.local.set({ pomoActive: false, pomoMilestones: [] });
            fireConfetti(); // 100% Celebration!
            document.getElementById('pomo-active').style.display = 'none';
            document.getElementById('pomo-setup').style.display = 'block';
            return;
        }

        // 2. Check for Milestones (30%, 60%)
        // Confetti is now handled by background.js to fire on the content page!
        // We only track progress here if needed for UI bars in future.
        if (res.workDuration > 0) {
            const totalMs = res.workDuration * 60000;
            const elapsed = totalMs - rem;
            const progress = (elapsed / totalMs) * 100;
            const milestones = res.pomoMilestones || [];

            // Just update storage if needed, but background does the heavy lifting now.
        }

        const m = Math.floor(rem / 60000); const s = Math.floor((rem % 60000) / 1000);
        document.getElementById('timerOutput').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    }, 1000);
}
