export async function setupOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['DOM_SCRAPING', 'CLIPBOARD'],
        justification: 'Local AI analysis for focus and user-requested screenshot clipboard copies.'
    });
    // Wait for the offscreen script to initialize its listeners
    await new Promise(resolve => setTimeout(resolve, 500));
}

export async function setupClipboardOffscreen() {
    // An already-open offscreen document may have been created before clipboard
    // support was added, so recreate it with an explicit CLIPBOARD reason.
    if (await chrome.offscreen.hasDocument()) await chrome.offscreen.closeDocument();
    await chrome.offscreen.createDocument({
        url: 'clipboard.html',
        reasons: ['CLIPBOARD'],
        justification: 'Copy a user-selected screenshot to the clipboard.'
    });
    await new Promise(resolve => setTimeout(resolve, 100));
}

export function isRelevantKeywords(goal, title) {
    if (!goal || !title) return false;
    const goalWords = goal.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const titleLower = title.toLowerCase();
    return goalWords.some(word => titleLower.includes(word));
}
