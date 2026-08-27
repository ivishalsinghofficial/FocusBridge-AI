/**
 * BACKGROUND.JS - Re-Wired Master (Modular Version)
 */
import { setupOffscreen, setupClipboardOffscreen, isRelevantKeywords } from './modules/bg-utils.js';

const tabStates = new Map();
let lastScore = 1.0;
// Calibrated with Xenova/all-MiniLM-L6-v2: cartoon/video 0.13, MDN JS guide
// 0.71, and general tech news mentioning JavaScript 0.39. Scores below this
// level receive a nudge; keep this named value easy to tune with new samples.
const SEMANTIC_TRIAGE_THRESHOLD = 0.32;
const TRIAGE_CONTENT_DELAY_MS = 2800;
const localDateKey = () => new Date().toLocaleDateString('en-CA');
const CAPTURE_DB = 'focusbridge-captures';
const CAPTURE_STORE = 'screenshots';

function captureDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CAPTURE_DB, 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(CAPTURE_STORE, { keyPath: 'id', autoIncrement: true });
      store.createIndex('timestamp', 'timestamp');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function compressCapture(dataUrl, format) {
  if (format === 'png') return dataUrl;
  // Do not fetch a data: URL here: extension-page CSP connect-src can block
  // it. Decode locally, just like the clipboard pipeline does.
  const match = /^data:([^;,]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error('Invalid screenshot image data.');
  const sourceBinary = atob(match[2]);
  const sourceBytes = new Uint8Array(sourceBinary.length);
  for (let index = 0; index < sourceBinary.length; index++) sourceBytes[index] = sourceBinary.charCodeAt(index);
  const source = new Blob([sourceBytes], { type: match[1] });
  const bitmap = await createImageBitmap(source);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  canvas.getContext('2d').drawImage(bitmap, 0, 0);
  const jpeg = await canvas.convertToBlob({ type: 'image/jpeg', quality: .85 });
  const jpegBytes = new Uint8Array(await jpeg.arrayBuffer());
  let jpegBinary = '';
  jpegBytes.forEach(byte => { jpegBinary += String.fromCharCode(byte); });
  return `data:image/jpeg;base64,${btoa(jpegBinary)}`;
}

async function saveCapture(imageDataUrl, format = 'jpeg') {
  const image = await compressCapture(imageDataUrl, format);
  const db = await captureDatabase();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(CAPTURE_STORE, 'readwrite');
    const store = transaction.objectStore(CAPTURE_STORE);
    store.add({ timestamp: Date.now(), imageDataUrl: image });
    const cursor = store.index('timestamp').openCursor();
    const records = [];
    cursor.onsuccess = () => { const current = cursor.result; if (current) { records.push(current); current.continue(); } else records.slice(0, -30).forEach(item => store.delete(item.primaryKey)); };
    transaction.oncomplete = resolve; transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

async function listCaptures() {
  const db = await captureDatabase();
  const records = await new Promise((resolve, reject) => { const request = db.transaction(CAPTURE_STORE).objectStore(CAPTURE_STORE).getAll(); request.onsuccess = () => resolve(request.result.sort((a, b) => b.timestamp - a.timestamp)); request.onerror = () => reject(request.error); });
  db.close(); return records;
}

async function deleteCapture(id) { const db = await captureDatabase(); await new Promise((resolve, reject) => { const request = db.transaction(CAPTURE_STORE, 'readwrite').objectStore(CAPTURE_STORE).delete(id); request.onsuccess = resolve; request.onerror = () => reject(request.error); }); db.close(); }

// 1. Navigation Monitor
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.title) {
    if (tabStates.has(tabId)) clearTimeout(tabStates.get(tabId));

    const timer = setTimeout(() => {
      chrome.storage.local.get(['userGoal', 'sessionActive', 'blocklist', 'allowlist', 'todaysGoal', 'todaysGoalDate'], async (res) => {
        // A New Tab intention can drive triage without requiring the popup session UI.
        const focusGoal = res.sessionActive ? res.userGoal : (res.todaysGoalDate === localDateKey() ? res.todaysGoal : '');
        if (!focusGoal || !tab.url || tab.url.startsWith("chrome://")) return;

        const urlLower = tab.url.toLowerCase();

        // TIER 1: BLOCKLIST
        if ((res.blocklist || []).some(site => urlLower.includes(site.toLowerCase()))) {
          chrome.tabs.sendMessage(tabId, { action: "showOverlay", goal: focusGoal }).catch(() => { });
          return;
        }

        // TIER 2: ALLOWLIST
        if ((res.allowlist || []).some(site => urlLower.includes(site.toLowerCase()))) {
          chrome.tabs.sendMessage(tabId, { action: "clearIntervention" }).catch(() => { });
          return;
        }

        // TIER 3: semantic triage. Do not use individual keyword matches here:
        // they caused irrelevant pages to skip the embedding comparison entirely.
        chrome.tabs.sendMessage(tabId, { action: "requestContext" }, async (response) => {
          if (chrome.runtime.lastError || !response?.context) return;
          const fullText = `${response.context.title} ${response.context.bodySnippet}`.toLowerCase();
          await setupOffscreen();
          chrome.runtime.sendMessage({
            target: 'offscreen',
            goal: focusGoal,
            title: fullText.substring(0, 2000),
            tabId: tabId
          });
        });
      });
    }, TRIAGE_CONTENT_DELAY_MS);
    tabStates.set(tabId, timer);
  }
});

// 2. MASTER MESSAGE LISTENER (Consolidated)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (['saveCapture', 'listCaptures', 'deleteCapture'].includes(message.action)) {
    (async () => {
      try {
        if (message.action === 'saveCapture') {
          await saveCapture(message.dataUrl, message.format);
          chrome.runtime.sendMessage({ action: 'captureSaved' }).catch(() => {});
        }
        if (message.action === 'listCaptures') return sendResponse({ success: true, captures: await listCaptures() });
        if (message.action === 'deleteCapture') await deleteCapture(message.id);
        sendResponse({ success: true });
      } catch (error) { sendResponse({ success: false, error: error.message }); }
    })();
    return true;
  }
  if (message.action === "captureVisibleScreenshot") {
    (async () => {
      try {
        const windowId = sender.tab?.windowId || (await chrome.windows.getCurrent()).id;
        const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'png' });
        sendResponse({ success: true, dataUrl });
      } catch (error) {
        sendResponse({ success: false, error: error.message || "Screenshot capture failed." });
      }
    })();
    return true;
  }

  if (message.action === "copyImageToClipboard") {
    setupClipboardOffscreen().then(() => {
      chrome.runtime.sendMessage({ target: 'clipboard-document', dataUrl: message.dataUrl }, (response) => {
        if (chrome.runtime.lastError) sendResponse({ success: false, error: chrome.runtime.lastError.message });
        else sendResponse(response || { success: false, error: "Clipboard copy did not complete." });
      });
    }).catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  // User-triggered only: capture the current viewport and copy it through the
  // offscreen document. Nothing is saved or sent to a service.
  if (message.action === "captureScreenshotToClipboard") {
    (async () => {
      try {
        const windowId = sender.tab?.windowId || (await chrome.windows.getCurrent()).id;
        const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: 'png' });
        await setupClipboardOffscreen();
        chrome.runtime.sendMessage({ target: 'clipboard-document', dataUrl }, (response) => {
          if (chrome.runtime.lastError) {
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse(response || { success: false, error: "Clipboard copy did not complete." });
          }
        });
      } catch (error) {
        sendResponse({ success: false, error: error.message || "Screenshot capture failed." });
      }
    })();
    return true;
  }

  // A. SYNCHRONOUS ACTIONS (No return true needed)
  if (message.action === "startPomo") {
    const end = Date.now() + (message.minutes * 60000);
    chrome.storage.local.set({ pomoActive: true, pomoEndTime: end, workDuration: message.minutes, currentStartTime: Date.now(), milestonesReached: [] });
    chrome.alarms.create('pomoAlarm', { delayInMinutes: message.minutes });
    chrome.alarms.clear('milestoneTicker');
    chrome.alarms.create('pomoMilestone30', { when: Date.now() + (message.minutes * 60000 * 0.30) });
    chrome.alarms.create('pomoMilestone60', { when: Date.now() + (message.minutes * 60000 * 0.60) });
    chrome.alarms.create('pomoMilestone90', { when: Date.now() + (message.minutes * 60000 * 0.90) });
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
    if (lastScore < SEMANTIC_TRIAGE_THRESHOLD) {
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

    const milestoneTypes = {
      pomoMilestone30: 'milestone-30',
      pomoMilestone60: 'milestone-60',
      pomoMilestone90: 'milestone-90'
    };
    if (milestoneTypes[alarm.name]) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "fireConfetti", type: milestoneTypes[alarm.name] }).catch(() => { });
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
          if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "fireConfetti", type: "milestone-30" }).catch(() => { });
        });
      }

      // 60%
      if (progress >= 60 && !milestones.includes(60)) {
        milestones.push(60);
        updated = true;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "fireConfetti", type: "milestone-60" }).catch(() => { });
        });
      }

      // 90%
      if (progress >= 90 && !milestones.includes(90)) {
        milestones.push(90);
        updated = true;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "fireConfetti", type: "milestone-90" }).catch(() => { });
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
  chrome.storage.local.get(['sessionActive', 'userGoal', 'todaysGoal', 'todaysGoalDate', 'history'], (res) => {
    const focusGoal = res.sessionActive ? res.userGoal : (res.todaysGoalDate === localDateKey() ? res.todaysGoal : '');
    if (!focusGoal) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0] || !tabs[0].url || tabs[0].url.startsWith('chrome://')) return;

      // Check purely based on title/url match (simple heuristic)
      // or rely on lastScore if updated recently?
      // Let's use isRelevantKeywords for robustness.
      const isProductive = isRelevantKeywords(focusGoal, tabs[0].title);

      if (isProductive) {
        const today = localDateKey();
        const history = res.history || {};
        history[today] = (history[today] || 0) + 1;
        chrome.storage.local.set({ history });
      }
    });
  });
}, 60000);
