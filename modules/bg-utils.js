export async function setupOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
        url: 'offscreen.html', reasons: ['DOM_SCRAPING'], justification: 'AI analysis for focus.'
    });
    // Wait for the offscreen script to initialize its listeners
    await new Promise(resolve => setTimeout(resolve, 500));
}

export function isRelevantKeywords(goal, title) {
    if (!goal || !title) return false;
    const goalWords = goal.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const titleLower = title.toLowerCase();
    return goalWords.some(word => titleLower.includes(word));
}
