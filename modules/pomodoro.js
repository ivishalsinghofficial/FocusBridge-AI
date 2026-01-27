export function initPomodoro() {
    document.getElementById('startPomoBtn').onclick = () => {
        const mins = parseInt(document.getElementById('pomoMins').value);
        chrome.runtime.sendMessage({ action: "startPomo", minutes: mins });
        const end = Date.now() + (mins * 60000);
        chrome.storage.local.set({ pomoActive: true, pomoEndTime: end });
        document.getElementById('pomo-setup').style.display = 'none';
        document.getElementById('pomo-active').style.display = 'block';
    };

    document.getElementById('stopPomoBtn').onclick = () => {
        chrome.alarms.clearAll();
        chrome.storage.local.set({ pomoActive: false });
        document.getElementById('pomo-setup').style.display = 'block';
        document.getElementById('pomo-active').style.display = 'none';
    };

    // Check state on load
    chrome.storage.local.get(['pomoActive', 'pomoEndTime'], (res) => {
        if (res.pomoActive) {
            const remaining = Math.max(0, res.pomoEndTime - Date.now());
            const m = Math.floor(remaining / 60000); const s = Math.floor((remaining % 60000) / 1000);
            document.getElementById('timerOutput').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
            document.getElementById('pomo-setup').style.display = 'none';
            document.getElementById('pomo-active').style.display = 'block';
        }
    });

    // Timer tick
    setInterval(async () => {
        const res = await chrome.storage.local.get(['pomoActive', 'pomoEndTime']);
        if (!res.pomoActive) return;
        const rem = res.pomoEndTime - Date.now();
        if (rem <= 0) { chrome.storage.local.set({ pomoActive: false }); return; }
        const m = Math.floor(rem / 60000); const s = Math.floor((rem % 60000) / 1000);
        document.getElementById('timerOutput').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    }, 1000);
}
