/** 
 * POPUP.JS - FOCUSBRIDGE AI MASTER (Modular Version)
 */
import { displayDailyStory } from './modules/stories.js';
import { loadAllStats } from './modules/stats.js';
import { updateSmartSuggest, renderRulesLedger } from './modules/rules.js';
import { initPomodoro } from './modules/pomodoro.js';
import { initTasks, renderTasks } from './modules/tasks.js';
import { loadAIReflection, initAICoach } from './modules/ai-coach.js';

// --- 1. INITIALIZATION & NAVIGATION ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('settingsButton')?.addEventListener('click', () => chrome.runtime.openOptionsPage());
  // A. Load Initial Data
  displayDailyStory();
  initPomodoro();
  initTasks();
  initAICoach();

  // B. Setup Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      item.classList.add('active');

      const tabId = item.dataset.tab;
      document.getElementById(tabId).classList.add('active');

      if (tabId === 'tab-stats') loadAllStats();
      if (tabId === 'tab-rules') { updateSmartSuggest(); renderRulesLedger(); }
      if (tabId === 'tab-ai') loadAIReflection();
    });
  });

  // C. Restore Focus Session State
  chrome.storage.local.get(['userGoal', 'sessionActive', 'subTasks'], (res) => {
    if (res.sessionActive && res.userGoal) {
      document.getElementById('displayGoal').innerText = res.userGoal;
      document.getElementById('setup-view').style.display = 'none';
      document.getElementById('active-view').style.display = 'block';
      renderTasks(res.subTasks || []);
    }
  });

  // D. Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  chrome.storage.local.get(['theme'], (res) => {
    if (res.theme === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggle.checked = true;
    }
  });

  themeToggle.addEventListener('change', () => {
    const isDark = themeToggle.checked;
    document.body.classList.toggle('dark-mode', isDark);
    chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
    // Reload charts if needed
    loadAllStats();
  });

  // E. Recall Anchor Logic (New UI)
  const recallToggle = document.getElementById('recallToggle');
  const recallSettings = document.getElementById('recall-settings');
  const recallConnected = document.getElementById('recall-connected-view');
  const recallSetup = document.getElementById('recall-setup-view');
  const providerLabel = document.getElementById('connectedProviderLabel');

  const disconnectBtn = document.getElementById('disconnectBtn');
  const expandBtn = document.getElementById('expandSettingsBtn');

  const apiKeyInput = document.getElementById('apiKeyInput');
  const verifyBtn = document.getElementById('verifyKeyBtn');
  const keyMsg = document.getElementById('keyStatusMsg');
  const providerRadios = document.querySelectorAll('input[name="aiProvider"]');

  // Helper: Update UI State
  const updateViewState = (hasKey, provider = 'Gemini') => {
    if (hasKey) {
      recallConnected.style.display = 'flex';
      recallSetup.style.display = 'none'; // Collapse by default
      providerLabel.innerText = `${provider.charAt(0).toUpperCase() + provider.slice(1)} Connected`;
      expandBtn.innerText = '+';
    } else {
      recallConnected.style.display = 'none';
      recallSetup.style.display = 'block';
      apiKeyInput.value = '';
      keyMsg.innerText = '';
    }
  };

  // Load Saved State
  chrome.storage.local.get(['recallActive', 'apiProvider', 'apiKey'], (res) => {
    // 1. Toggle State
    recallToggle.checked = !!res.recallActive;
    recallSettings.style.display = res.recallActive ? 'block' : 'none';

    // 2. API Provider
    if (res.apiProvider) {
      const radio = document.querySelector(`input[name="aiProvider"][value="${res.apiProvider}"]`);
      if (radio) radio.checked = true;
    }

    // 3. View State
    updateViewState(!!res.apiKey, res.apiProvider || 'gemini');
    if (res.apiKey) apiKeyInput.value = res.apiKey;
  });

  // Toggle Listener
  recallToggle.addEventListener('change', () => {
    const isActive = recallToggle.checked;
    chrome.storage.local.set({ recallActive: isActive });
    recallSettings.style.display = isActive ? 'block' : 'none';
  });

  // API Provider Listener & Help Text
  const helpDiv = document.getElementById('providerHelp');

  const updateHelp = (provider) => {
    if (provider === 'gemini') {
      helpDiv.innerHTML = `<a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: var(--primary);">Get Free Gemini API Key here</a>`;
    } else {
      helpDiv.innerHTML = `Requires paid account. <a href="https://platform.openai.com/api-keys" target="_blank" style="color: var(--primary);">Get ChatGPT Key here</a>`;
    }
  };

  providerRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      chrome.storage.local.set({ apiProvider: e.target.value });
      updateHelp(e.target.value);
    });
  });

  // Initialize Help Text
  chrome.storage.local.get(['apiProvider'], (res) => {
    if (res.apiProvider) updateHelp(res.apiProvider);
  });

  // API Key Listener (Save on blur) - REMOVED to prevent saving invalid keys
  // apiKeyInput.addEventListener('blur', () => { });

  // Disconnect Listener
  disconnectBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['apiKey']); // Keep provider preference?
    updateViewState(false);
  });

  // Expand Listener
  expandBtn.addEventListener('click', () => {
    const isHidden = recallSetup.style.display === 'none';
    recallSetup.style.display = isHidden ? 'block' : 'none';
    expandBtn.innerText = isHidden ? '-' : '+';
  });

  // I. Blueprint Toggle
  const toggleBlueprintBtn = document.getElementById('toggleBlueprint');
  const blueprintContent = document.getElementById('blueprintContent');

  if (toggleBlueprintBtn && blueprintContent) {
    toggleBlueprintBtn.addEventListener('click', () => {
      const isHidden = blueprintContent.style.display === 'none';
      blueprintContent.style.display = isHidden ? 'block' : 'none';
      toggleBlueprintBtn.innerText = isHidden ? '-' : '+';
    });
  }

  // J. What's New Banner
  const whatsNewBanner = document.getElementById('whatsNewBanner');
  const closeWhatsNew = document.getElementById('closeWhatsNew');

  if (whatsNewBanner) {
    chrome.storage.local.get(['whatsNewDismissed'], (res) => {
      if (!res.whatsNewDismissed) {
        whatsNewBanner.style.display = 'block';
      }
    });

    if (closeWhatsNew) {
      closeWhatsNew.addEventListener('click', () => {
        whatsNewBanner.style.display = 'none';
        chrome.storage.local.set({ whatsNewDismissed: true });
      });
    }
  }

  // Verify Button Listener
  verifyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    const provider = document.querySelector('input[name="aiProvider"]:checked').value;

    if (!key) {
      keyMsg.innerText = "Please enter a key first.";
      keyMsg.style.color = "red";
      return;
    }

    keyMsg.innerText = "Verifying, please wait 10 secs...";
    keyMsg.style.color = "#888";
    verifyBtn.disabled = true;

    chrome.runtime.sendMessage({
      action: "verifyApiKey",
      provider: provider,
      key: key
    }, (response) => {
      verifyBtn.disabled = false;
      if (chrome.runtime.lastError) {
        keyMsg.innerText = "Error contacting backend.";
        keyMsg.style.color = "red";
        return;
      }

      if (response && response.success) {
        keyMsg.innerText = "Success! Saved.";
        keyMsg.style.color = "green";
        chrome.storage.local.set({ apiKey: key, apiProvider: provider });

        // Switch to connected view after short delay
        setTimeout(() => {
          updateViewState(true, provider);
        }, 1000);

      } else {
        // Show specific error if available
        keyMsg.innerText = (response.error || "Invalid Key.").substring(0, 40) + "...";
        keyMsg.title = response.error || "Check console for details"; // Tooltip for full error
        keyMsg.style.color = "red";
      }
    });
  });
});

// --- 2. FOCUS SESSION CONTROLS ---
document.getElementById('startFocusBtn').onclick = () => {
  const goal = document.getElementById('mainGoalInput').value.trim();
  if (goal) chrome.storage.local.set({ userGoal: goal, sessionActive: true, subTasks: [] }, () => {
    document.getElementById('displayGoal').innerText = goal;
    document.getElementById('setup-view').style.display = 'none';
    document.getElementById('active-view').style.display = 'block';
  });
};

document.getElementById('endFocusBtn').onclick = () => {
  chrome.storage.local.remove(['userGoal', 'sessionActive', 'subTasks', 'pomoActive'], () => {
    chrome.alarms.clearAll();
    chrome.runtime.sendMessage({ action: "broadcastEndSession" });
    location.reload();
  });
};

document.getElementById('feedbackBtn').onclick = () => {
  chrome.tabs.create({
    url: 'https://forms.gle/rJS3Z3VzszQ9zDxW8'
  });
};
