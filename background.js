/**
 * BACKGROUND.JS - Re-Wired Master
 */
const tabStates = new Map();
let lastScore = 1.0;

async function setupOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html', reasons: ['DOM_SCRAPING'], justification: 'AI analysis for focus.'
  });
}

function isRelevantKeywords(goal, title) {
  if (!goal || !title) return false;
  const goalWords = goal.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const titleLower = title.toLowerCase();
  return goalWords.some(word => titleLower.includes(word));
}

// 1. Navigation Monitor
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.title) {
    if (tabStates.has(tabId)) clearTimeout(tabStates.get(tabId));

    const timer = setTimeout(() => {
      chrome.storage.local.get(['userGoal', 'sessionActive', 'blocklist', 'allowlist'], async (res) => {
        if (!res.userGoal || !res.sessionActive || !tab.url || tab.url.startsWith("chrome://")) return;

        const urlLower = tab.url.toLowerCase();

        // TIER 1: BLOCKLIST
        if ((res.blocklist || []).some(site => urlLower.includes(site.toLowerCase()))) {
          chrome.tabs.sendMessage(tabId, { action: "showOverlay", goal: res.userGoal }).catch(()=>{});
          return;
        }

        // TIER 2: ALLOWLIST
        if ((res.allowlist || []).some(site => urlLower.includes(site.toLowerCase()))) {
          chrome.tabs.sendMessage(tabId, { action: "clearIntervention" }).catch(()=>{});
          return;
        }

        // TIER 3: KEYWORDS
        if (isRelevantKeywords(res.userGoal, tab.title)) {
          chrome.tabs.sendMessage(tabId, { action: "clearIntervention" }).catch(()=>{});
          lastScore = 1.0;
        } else {
          // TIER 4: AI SCRAPER
          chrome.tabs.sendMessage(tabId, { action: "requestContext" }, async (response) => {
            if (chrome.runtime.lastError || !response?.context) return;
            const fullText = `${response.context.title} ${response.context.bodySnippet}`.toLowerCase();
            
            if (isRelevantKeywords(res.userGoal, fullText)) {
              chrome.tabs.sendMessage(tabId, { action: "clearIntervention" }).catch(()=>{});
              lastScore = 1.0;
            } else {
              await setupOffscreen();
              // FIX: Sending target 'offscreen' so the AI engine hears it
              chrome.runtime.sendMessage({ 
                target: 'offscreen', 
                goal: res.userGoal, 
                title: fullText.substring(0, 500), 
                tabId: tabId 
              });
            }
          });
        }
      });
    }, 1500);
    tabStates.set(tabId, timer);
  }
});

// 2. Message Listener
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "startPomo") {
    const end = Date.now() + (message.minutes * 60000);
    chrome.storage.local.set({ pomoActive: true, pomoEndTime: end, workDuration: message.minutes, currentStartTime: Date.now(), milestonesReached: [] });
    chrome.alarms.create('pomoAlarm', { delayInMinutes: message.minutes });
    chrome.alarms.create('milestoneTicker', { periodInMinutes: 1 });
  }

  if (message.action === "broadcastClear") {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, { action: "clearIntervention" }).catch(() => {}));
    });
  }

  // Handle Score results coming FROM offscreen.js
  if (message.target === 'background') {
    lastScore = message.score;
    if (lastScore < 0.15) {
      chrome.tabs.sendMessage(message.tabId, { action: "showIntervention", goal: message.goal }).catch(()=>{});
    } else {
      chrome.tabs.sendMessage(message.tabId, { action: "clearIntervention" }).catch(()=>{});
    }
  }

  if (message.action === "broadcastEndSession") {
    // Find every open tab in every window
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        // Send the clear command to each content script
        chrome.tabs.sendMessage(tab.id, { action: "clearIntervention" }).catch(() => {
          /* Ignore errors for system pages like chrome:// settings */
        });
      });
    });
  }
});

// 3. Alarms (Pomodoro & Ribbons)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  const res = await chrome.storage.local.get(['workDuration', 'currentStartTime', 'milestonesReached']);
  
  if (alarm.name === 'pomoAlarm') {
    chrome.storage.local.set({ pomoActive: false });
    chrome.tabs.query({active: true, currentWindow: true}, (t) => {
       if(t[0]) chrome.tabs.sendMessage(t[0].id, { action: "fireRibbons", type: "big" }).catch(()=>{});
    });
    chrome.alarms.clear('milestoneTicker');
  }

  if (alarm.name === 'milestoneTicker' && res.workDuration) {
    const progress = ((Date.now() - res.currentStartTime) / 60000 / res.workDuration) * 100;
    [25, 50, 75].forEach(m => {
      if (progress >= m && !res.milestonesReached.includes(m)) {
        chrome.tabs.query({active: true, currentWindow: true}, (t) => {
           if(t[0]) chrome.tabs.sendMessage(t[0].id, { action: "fireRibbons", type: "small" }).catch(()=>{});
        });
        res.milestonesReached.push(m);
        chrome.storage.local.set({ milestonesReached: res.milestonesReached });
      }
    });
  }
});

// 4. Wellbeing Tracker
setInterval(() => {
  chrome.storage.local.get(['sessionActive', 'productiveMinutes', 'history'], (res) => {
    if (res.sessionActive && lastScore >= 0.15) {
      const today = new Date().toISOString().split('T')[0];
      let history = res.history || {};
      history[today] = (history[today] || 0) + 1;
      chrome.storage.local.set({ productiveMinutes: (res.productiveMinutes || 0) + 1, history: history });
    }
  });
}, 60000);