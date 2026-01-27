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