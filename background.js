/**
 * BACKGROUND.JS - Re-Wired Master (Modular Version)
 */
import { setupOffscreen, isRelevantKeywords } from './modules/bg-utils.js';

const tabStates = new Map();
let lastScore = 1.0;

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
          chrome.tabs.sendMessage(tabId, { action: "showOverlay", goal: res.userGoal }).catch(() => { });
          return;
        }

        // TIER 2: ALLOWLIST
        if ((res.allowlist || []).some(site => urlLower.includes(site.toLowerCase()))) {
          chrome.tabs.sendMessage(tabId, { action: "clearIntervention" }).catch(() => { });
          return;
        }

        // TIER 3: KEYWORDS
        if (isRelevantKeywords(res.userGoal, tab.title)) {
          chrome.tabs.sendMessage(tabId, { action: "clearIntervention" }).catch(() => { });
          lastScore = 1.0;
        } else {
          // TIER 4: AI SCRAPER
          chrome.tabs.sendMessage(tabId, { action: "requestContext" }, async (response) => {
            if (chrome.runtime.lastError || !response?.context) return;
            const fullText = `${response.context.title} ${response.context.bodySnippet}`.toLowerCase();

            if (isRelevantKeywords(res.userGoal, fullText)) {
              chrome.tabs.sendMessage(tabId, { action: "clearIntervention" }).catch(() => { });
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

// 2. MASTER MESSAGE LISTENER (Consolidated)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // A. SYNCHRONOUS ACTIONS (No return true needed)
  if (message.action === "startPomo") {
    const end = Date.now() + (message.minutes * 60000);
    chrome.storage.local.set({ pomoActive: true, pomoEndTime: end, workDuration: message.minutes, currentStartTime: Date.now(), milestonesReached: [] });
    chrome.alarms.create('pomoAlarm', { delayInMinutes: message.minutes });
    chrome.alarms.create('milestoneTicker', { periodInMinutes: 1 });
    return false;
  }

  if (message.action === "broadcastClear") {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => chrome.tabs.sendMessage(tab.id, { action: "clearIntervention" }).catch(() => { }));
    });
    return false;
  }

  if (message.action === "broadcastEndSession") {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: "clearIntervention" }).catch(() => { });
      });
    });
    return false;
  }

  if (message.target === 'background') {
    lastScore = message.score;
    if (lastScore < 0.15) {
      chrome.tabs.sendMessage(message.tabId, { action: "showIntervention", goal: message.goal }).catch(() => { });
    } else {
      chrome.tabs.sendMessage(message.tabId, { action: "clearIntervention" }).catch(() => { });
    }
    return false;
  }

  // B. ASYNCHRONOUS ACTIONS (Must return true)

  // 1. Validate Recall Trigger
  if (message.action === "validateRecall") {
    setupOffscreen().then(() => {
      const reqId = Date.now().toString();
      pendingValidations.set(reqId, sendResponse);
      chrome.runtime.sendMessage({
        target: 'offscreen-recall',
        reqId: reqId,
        userSummary: message.userSummary,
        pageSnippet: message.pageSnippet
      });
    }).catch(err => sendResponse({ error: err.message }));
    return true;
  }

  // 2. Handle Offscreen Response
  if (message.target === 'background-recall') {
    const callback = pendingValidations.get(message.reqId);
    if (callback) {
      if (message.error) {
        callback({ error: message.error });
      } else {
        callback({ score: message.score });
      }
      pendingValidations.delete(message.reqId);
    }
    return false;
  }

  // 3. Verify API Key
  if (message.action === "verifyApiKey") {
    setupOffscreen().then(() => {
      chrome.runtime.sendMessage({
        target: 'offscreen-api',
        subAction: 'verify',
        provider: message.provider,
        key: message.key
      }, (response) => {
        if (chrome.runtime.lastError) sendResponse({ success: false, error: "Offscreen Unreachable" });
        else sendResponse(response);
      });
    }).catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  // 4. Generate Quiz
  if (message.action === "generateQuiz") {
    setupOffscreen().then(() => {
      chrome.storage.local.get(['apiProvider', 'apiKey'], (res) => {
        if (!res.apiKey) {
          sendResponse({ error: "No API Key found." });
          return;
        }
        chrome.runtime.sendMessage({
          target: 'offscreen-api',
          subAction: 'generate',
          provider: res.apiProvider || 'gemini',
          key: res.apiKey,
          context: message.context
        }, (response) => {
          // Relay the response back to content.js
          if (chrome.runtime.lastError) {
            console.error("BG: Offscreen Error", chrome.runtime.lastError);
            sendResponse({ error: "AI Engine Offline: " + chrome.runtime.lastError.message });
          } else {
            sendResponse(response);
          }
        });
      });
    }).catch(err => {
      console.error("BG: Setup Failed", err);
      sendResponse({ error: "AI Setup Failed: " + err.message });
    });
    return true; // Keep channel open
  }

  return false; // Default: close channel
});

// 3. COMPLETE ALARMS & MILESTONES
chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.storage.local.get(['pomoActive', 'pomoEndTime', 'workDuration', 'pomoMilestones'], (res) => {
    if (!res.pomoActive) return;

    // A. TIME'S UP (pomoAlarm)
    if (alarm.name === 'pomoAlarm') {
      chrome.storage.local.set({ pomoActive: false, pomoMilestones: [] });
      // Notify all tabs to celebrate
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "fireConfetti", type: "finish" }).catch(() => { });
        // NOTE: We sent 'type' so content script can decide intensity if needed
      });
      return;
    }

    // B. MILESTONE CHECKER (milestoneTicker)
    if (alarm.name === 'milestoneTicker') {
      const remaining = res.pomoEndTime - Date.now();
      if (remaining <= 0) return;

      const totalMs = res.workDuration * 60000;
      const elapsed = totalMs - remaining;
      const progress = (elapsed / totalMs) * 100;
      const milestones = res.pomoMilestones || [];
      let updated = false;

      // 30%
      if (progress >= 30 && !milestones.includes(30)) {
        milestones.push(30);
        updated = true;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "fireConfetti", type: "milestone" }).catch(() => { });
        });
      }

      // 60%
      if (progress >= 60 && !milestones.includes(60)) {
        milestones.push(60);
        updated = true;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "fireConfetti", type: "milestone" }).catch(() => { });
        });
      }

      if (updated) {
        chrome.storage.local.set({ pomoMilestones: milestones });
      }
    }
  });
});

// 6. TOGGLE SYNC
chrome.storage.onChanged.addListener((changes) => {
  if (changes.recallActive) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(t => chrome.tabs.sendMessage(t.id, { action: "updateRecallState", active: changes.recallActive.newValue }).catch(() => { }));
    });
  }
});

// 7. STATS TRACKER (Every Minute)
setInterval(() => {
  chrome.storage.local.get(['sessionActive', 'userGoal', 'history'], (res) => {
    if (!res.sessionActive || !res.userGoal) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0] || !tabs[0].url || tabs[0].url.startsWith('chrome://')) return;

      // Check purely based on title/url match (simple heuristic)
      // or rely on lastScore if updated recently?
      // Let's use isRelevantKeywords for robustness.
      const isProductive = isRelevantKeywords(res.userGoal, tabs[0].title);

      if (isProductive) {
        const today = new Date().toISOString().split('T')[0];
        const history = res.history || {};
        history[today] = (history[today] || 0) + 1;
        chrome.storage.local.set({ history });
      }
    });
  });
}, 60000);