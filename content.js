/**
 * CONTENT.JS - FocusBridge AI (Robust + Elastic UI Edition + Recall Anchor)
 */

let activeGoalText = "";
let isDistractionMode = false;
let isNudgeActive = false;
let currentTheme = 'light';

// RECALL ANCHOR VARIABLES
let recallActive = false;
let lastScrollDepth = 0;
let timeOnPage = 0;
let lastRecallScroll = 0; // Prevent duplicate prompts
let recallTimerInterval = null;

// Helper: Check if the extension context is still alive
function isValid() {
  return typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
}

// 1. SELF-HEALING BODYGUARD
const bodyguard = new MutationObserver(() => {
  if (!isValid()) {
    bodyguard.disconnect();
    return;
  }

  if (isNudgeActive) {
    if (!document.getElementById("focus-bridge-glow-top") && isDistractionMode) {
      renderOrangeFlash(activeGoalText);
    }
    if (!document.getElementById("focus-bubble-root")) {
      renderFocusBubble(activeGoalText, isDistractionMode);
    }
  }
});

// 2. THEME MANAGEMENT
const updateBubbleTheme = (theme) => {
  if (!isValid()) return;
  currentTheme = theme;
  const bubble = document.getElementById("focus-bubble-root");
  if (!bubble) return;

  const isDark = theme === 'dark';
  bubble.style.background = isDark ? "#1a1a1a" : "#ffffff";
  bubble.style.borderColor = isDark ? "#333" : "#e0e0e0";
  bubble.style.boxShadow = isDark ? "0 8px 30px rgba(0,0,0,0.5)" : "0 8px 25px rgba(0,0,0,0.15)";

  const goalText = document.getElementById("bubbleGoalText");
  if (goalText) goalText.style.color = isDark ? "#fff" : "#000";

  const mins = document.getElementById("pomoMins");
  if (mins) mins.style.color = isDark ? "#eee" : "#333";

  const circleBg = bubble.querySelector('circle[stroke-width="3"]:first-child');
  if (circleBg) circleBg.setAttribute("stroke", isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)");

  const quizBtn = document.getElementById("focus-quiz-btn");
  if (quizBtn) {
    quizBtn.style.background = isDark ? '#333' : '#f5f5f5';
    quizBtn.style.color = isDark ? '#aaa' : '#666';
  }
};

// 3. RENDER THE TOP ORANGE FLASH
function renderOrangeFlash(goal) {
  if (!isValid() || document.getElementById("focus-bridge-glow-top")) return;
  const glow = document.createElement("div");
  glow.id = "focus-bridge-glow-top";
  glow.style.cssText = `position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:120px!important;pointer-events:none!important;z-index:2147483646!important;background:linear-gradient(to bottom, rgba(255, 165, 0, 0.7) 0%, rgba(255, 165, 0, 0) 100%)!important;will-change:opacity;animation:breatheTop 3s infinite ease-in-out!important;`;

  if (!document.getElementById("focus-bridge-anim")) {
    const style = document.createElement("style");
    style.id = "focus-bridge-anim";
    style.textContent = `@keyframes breatheTop { 0% {opacity:0.2;} 50% {opacity:0.8;} 100% {opacity:0.2;} }`;
    document.documentElement.appendChild(style);
  }
  document.documentElement.appendChild(glow);
}

// 4. RENDER THE FLUID BUBBLE
// 4. RENDER THE FLUID BUBBLE
function renderFocusBubble(goal, isDistracted = false) {
  if (document.getElementById("focus-bubble-root")) return;
  activeGoalText = goal;

  const bubble = document.createElement("div");
  bubble.id = "focus-bubble-root";
  const isDark = currentTheme === 'dark';

  // Decide initial shape based on distraction state
  const initialWidth = isDistracted ? "auto" : "60px";
  const initialRadius = isDistracted ? "12px" : "30px";

  // Base Variables
  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const border = isDark ? "#333" : "#e0e0e0";
  const shadow = isDark ? "0 8px 30px rgba(0,0,0,0.5)" : "0 8px 25px rgba(0,0,0,0.15)";

  Object.assign(bubble.style, {
    position: "fixed", bottom: "30px", right: "30px",
    width: initialWidth, height: "60px",
    minWidth: isDistracted ? "140px" : "60px",
    maxWidth: "400px", // Constrain max width
    zIndex: "2147483647", cursor: "grab", borderRadius: initialRadius,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: shadow, userSelect: "none", overflow: "hidden",
    border: `1px solid ${border}`, background: bg,
    transition: "width 0.3s cubic-bezier(0.25, 1, 0.5, 1), background 0.3s, box-shadow 0.3s"
  });

  // Create Pomo Container (State 1)
  constomoContainer = document.createElement('div');
  const pomoContainer = document.createElement('div');
  pomoContainer.id = "pomoContainer";
  Object.assign(pomoContainer.style, {
    position: "relative", width: "60px", height: "60px", flexShrink: "0",
    display: isDistracted ? 'none' : 'flex', alignItems: "center", justifyContent: "center"
  });

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "60");
  svg.setAttribute("height", "60");
  svg.style.cssText = "position:absolute; transform: rotate(-90deg); pointer-events: none;";

  const circleBg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circleBg.setAttribute("cx", "30"); circleBg.setAttribute("cy", "30"); circleBg.setAttribute("r", "26");
  circleBg.setAttribute("stroke", isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)");
  circleBg.setAttribute("stroke-width", "3");
  circleBg.setAttribute("fill", "none");

  const circleRing = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circleRing.id = "bubbleRing";
  circleRing.setAttribute("cx", "30"); circleRing.setAttribute("cy", "30"); circleRing.setAttribute("r", "26");
  circleRing.setAttribute("stroke", "#2ecc71"); circleRing.setAttribute("stroke-width", "3");
  circleRing.setAttribute("fill", "none");
  circleRing.setAttribute("stroke-dasharray", "164"); circleRing.setAttribute("stroke-dashoffset", "164");
  circleRing.setAttribute("stroke-linecap", "round");
  circleRing.style.transition = "stroke-dashoffset 1s linear";

  svg.appendChild(circleBg);
  svg.appendChild(circleRing);

  const minsSpan = document.createElement('span');
  minsSpan.id = "pomoMins";
  minsSpan.style.cssText = `font-size: 14px; font-weight: 700; font-family: 'Inter', sans-serif; color:${isDark ? '#eee' : '#333'};`;
  minsSpan.innerText = "--";

  pomoContainer.appendChild(svg);
  pomoContainer.appendChild(minsSpan);

  // Create Content Container (State 2)
  const bubbleContent = document.createElement('div');
  bubbleContent.id = "bubbleContent";
  Object.assign(bubbleContent.style, {
    display: isDistracted ? 'flex' : 'none',
    alignItems: 'center',
    padding: "0 10px 0 0",
    height: "100%",
    maxWidth: "100%",
    overflow: "hidden"
  });

  // Text Container
  const textContainer = document.createElement('div');
  textContainer.style.cssText = "display:flex; flex-direction:column; justify-content:center; padding:0 12px; overflow:hidden;";

  const targetLabel = document.createElement('div');
  targetLabel.innerText = "FOCUS GOAL";
  targetLabel.style.cssText = `font-size:9px; font-weight:700; color:#aaa; letter-spacing:0.5px; margin-bottom:2px;`;

  const goalTextEl = document.createElement('div');
  goalTextEl.id = "bubbleGoalText";
  // Truncate text strictly to 15 chars + ...
  const displayGoal = goal.length > 15 ? goal.substring(0, 15) + "..." : goal;
  goalTextEl.innerText = displayGoal;
  goalTextEl.title = goal; // Tooltip for full text

  goalTextEl.style.cssText = `
    color: ${isDark ? '#fff' : '#000'}; 
    font-weight: 600; 
    font-size: 13px; 
    line-height: 1.3;
    overflow: hidden;
    white-space: nowrap;
  `;

  textContainer.appendChild(targetLabel);
  textContainer.appendChild(goalTextEl);

  // Add Quiz Button (Sleek Style)
  const quizBtn = document.createElement('div');
  quizBtn.id = "focus-quiz-btn";
  // Use SVG for Brain (Borderline/Outline Style)
  const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgIcon.setAttribute("width", "20");
  svgIcon.setAttribute("height", "20");
  svgIcon.setAttribute("viewBox", "0 0 24 24");
  svgIcon.setAttribute("fill", "none");
  svgIcon.setAttribute("stroke", "currentColor");
  svgIcon.setAttribute("stroke-width", "2");
  svgIcon.setAttribute("stroke-linecap", "round");
  svgIcon.setAttribute("stroke-linejoin", "round");

  const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.setAttribute("d", "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z");

  const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path2.setAttribute("d", "M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z");

  svgIcon.appendChild(path1);
  svgIcon.appendChild(path2);
  quizBtn.appendChild(svgIcon);
  quizBtn.title = "Take a Quiz";
  quizBtn.style.cssText = `
    cursor:pointer; 
    margin-left:8px; 
    width:36px; height:36px; flex-shrink:0;
    border-radius:10px; 
    background:${isDark ? '#333' : '#f5f5f5'}; 
    color:${isDark ? '#aaa' : '#666'};
    display:flex; align-items:center; justify-content:center; 
    transition:all 0.2s ease;
  `;

  quizBtn.onmouseover = () => {
    quizBtn.style.background = isDark ? '#444' : '#e0e0e0';
    quizBtn.style.color = '#ffa500';
    quizBtn.style.transform = 'scale(1.05)';
  };
  quizBtn.onmouseout = () => {
    quizBtn.style.background = isDark ? '#333' : '#f5f5f5';
    quizBtn.style.color = isDark ? '#aaa' : '#666';
    quizBtn.style.transform = 'scale(1)';
  };

  quizBtn.onclick = (e) => {
    e.stopPropagation();
    renderRecallSetupModal();
  };

  bubbleContent.appendChild(textContainer);
  bubbleContent.appendChild(quizBtn);

  bubble.appendChild(pomoContainer);
  bubble.appendChild(bubbleContent);

  document.documentElement.appendChild(bubble);

  // Hover Interactions
  bubble.onmouseenter = () => { if (isValid() && !isDistractionMode) expandBubble(); };
  bubble.onmouseleave = () => { if (isValid() && !isDistractionMode) collapseBubble(); };

  // Drag Logic
  let isDragging = false;
  bubble.onmousedown = (e) => {
    if (e.target.closest('#focus-quiz-btn')) return;
    if (!isValid()) return;

    isDragging = true;
    let startX = e.clientX - bubble.offsetLeft;
    let startY = e.clientY - bubble.offsetTop;
    bubble.style.transition = 'none'; // Disable transition during drag

    document.onmousemove = (e) => {
      if (!isDragging) return;
      bubble.style.left = (e.clientX - startX) + 'px';
      bubble.style.top = (e.clientY - startY) + 'px';
      bubble.style.right = 'auto'; bubble.style.bottom = 'auto';
    };

    document.onmouseup = () => {
      isDragging = false;
      document.onmousemove = null;
      bubble.style.transition = "width 0.3s, background 0.3s, box-shadow 0.3s"; // Restore
    };
  };
}

function expandBubble() {
  const bubble = document.getElementById("focus-bubble-root");
  const pomo = document.getElementById("pomoContainer");
  const content = document.getElementById("bubbleContent");
  if (!bubble) return;

  bubble.style.width = "auto";
  bubble.style.borderRadius = "14px";
  bubble.style.paddingRight = "6px"; // Extra padding for button

  if (pomo) pomo.style.display = isDistractionMode ? "none" : "flex"; // Keep pomo visible!
  // Wait, design choice: Do we hide timer on expand? 
  // User said "hovering expands". Usually we show text alongside timer.
  // My previous code: `display: isDistracted ? 'none' : 'flex'`. 
  // Let's keep timer visible on left, text on right.

  if (content) content.style.display = "flex";
}

function collapseBubble() {
  const bubble = document.getElementById("focus-bubble-root");
  const pomo = document.getElementById("pomoContainer");
  const content = document.getElementById("bubbleContent");
  if (bubble && !isDistractionMode) {
    bubble.style.width = "60px";
    bubble.style.borderRadius = "30px";
    bubble.style.paddingRight = "0";
    if (content) content.style.display = "none";
    if (pomo) pomo.style.display = "flex";
  }
}

// 5. POMODORO SYNC
setInterval(async () => {
  if (!isValid()) return;
  chrome.storage.local.get(['pomoActive', 'pomoEndTime', 'workDuration'], (res) => {
    if (chrome.runtime.lastError || !res) return;
    const ring = document.getElementById("bubbleRing");
    const minsTxt = document.getElementById("pomoMins");
    if (!ring || !minsTxt) return;
    if (!res.pomoActive) { ring.style.strokeDashoffset = 164; minsTxt.innerText = "--"; return; }
    const remaining = Math.max(0, res.pomoEndTime - Date.now());
    minsTxt.innerText = Math.floor(remaining / 60000) + "m";
    ring.style.strokeDashoffset = 164 * (1 - (remaining / (res.workDuration * 60000)));
  });
}, 1000);

// ==========================================
// RECALL ANCHOR LOGIC (Manual Mode)
// ==========================================

function renderRecallSetupModal() {
  if (document.getElementById('recall-setup-overlay')) return;

  const overlay = createBaseOverlay('recall-setup-overlay');
  document.documentElement.appendChild(overlay);

  const box = overlay.querySelector('#recall-content-box');
  box.innerHTML = ''; // Clear default loader

  const isDark = currentTheme === 'dark';
  const textColor = isDark ? '#e0e0e0' : '#333';
  const subTextColor = isDark ? '#aaa' : '#666';
  const borderColor = isDark ? '#333' : '#eee';
  const btnBg = isDark ? '#2c2c2c' : 'white';
  const btnBorder = isDark ? '#444' : '#ddd';

  // Close Button
  const closeBtn = document.createElement('div');
  closeBtn.innerHTML = "&times;";
  closeBtn.style.cssText = `
    position:absolute; top:10px; right:15px; 
    font-size:24px; cursor:pointer; color:${subTextColor}; 
    line-height:1; z-index:10; transition:color 0.2s;
  `;
  closeBtn.onmouseover = () => closeBtn.style.color = '#ffa500';
  closeBtn.onmouseout = () => closeBtn.style.color = subTextColor;
  closeBtn.onclick = () => overlay.remove();
  box.appendChild(closeBtn);

  // Header
  const header = document.createElement('div');
  header.style.cssText = `padding:20px; border-bottom:1px solid ${borderColor}; font-weight:bold; color:${textColor}; font-size:18px;`;
  header.innerText = "Recall Challenge Setup";
  box.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.style.cssText = "padding:25px; text-align:left;";

  // 1. Difficulty
  const labelDiff = document.createElement('div');
  labelDiff.innerText = "Difficulty Level";
  labelDiff.style.cssText = `font-size:13px; font-weight:bold; color:${subTextColor}; margin-bottom:10px;`;
  body.appendChild(labelDiff);

  const diffContainer = document.createElement('div');
  diffContainer.style.cssText = "display:flex; gap:10px; margin-bottom:20px;";
  let selectedDiff = "Moderate";

  ['Easy', 'Moderate', 'Legend'].forEach(level => {
    const btn = document.createElement('button');
    btn.innerText = level;
    btn.className = 'recall-opt-btn';

    // Default Style
    const styleDefault = `flex:1; padding:10px; border:1px solid ${level === 'Moderate' ? '#ffa500' : btnBorder}; background:${level === 'Moderate' ? '#fff3e0' : btnBg}; border-radius:8px; cursor:pointer; font-weight:600; color:${level === 'Moderate' ? '#ffa500' : subTextColor};`;

    btn.style.cssText = styleDefault;

    btn.onclick = () => {
      selectedDiff = level;
      diffContainer.querySelectorAll('button').forEach(b => {
        b.style.borderColor = btnBorder; b.style.background = btnBg; b.style.color = subTextColor;
      });
      // Active Style
      btn.style.borderColor = '#ffa500';
      btn.style.background = '#fff3e0';
      btn.style.color = '#ffa500';
    };
    diffContainer.appendChild(btn);
  });
  body.appendChild(diffContainer);

  // 2. Questions Count
  const labelCount = document.createElement('div');
  labelCount.innerText = "Number of Questions";
  labelCount.style.cssText = `font-size:13px; font-weight:bold; color:${subTextColor}; margin-bottom:10px;`;
  body.appendChild(labelCount);

  const countContainer = document.createElement('div');
  countContainer.style.cssText = "display:flex; gap:10px; margin-bottom:25px;";
  let selectedCount = 5;

  [5, 10, 15].forEach(num => {
    const btn = document.createElement('button');
    btn.innerText = num;
    const styleDefault = `flex:1; padding:10px; border:1px solid ${num === 5 ? '#ffa500' : btnBorder}; background:${num === 5 ? '#fff3e0' : btnBg}; border-radius:8px; cursor:pointer; font-weight:600; color:${num === 5 ? '#ffa500' : subTextColor};`;

    btn.style.cssText = styleDefault;

    btn.onclick = () => {
      selectedCount = num;
      countContainer.querySelectorAll('button').forEach(b => {
        b.style.borderColor = btnBorder; b.style.background = btnBg; b.style.color = subTextColor;
      });
      btn.style.borderColor = '#ffa500';
      btn.style.background = '#fff3e0';
      btn.style.color = '#ffa500';
    };
    countContainer.appendChild(btn);
  });
  body.appendChild(countContainer);

  // Action Button
  const startBtn = document.createElement('button');
  startBtn.innerText = "Challenge Me Now 🚀";
  startBtn.style.cssText = `width:100%; padding:15px; background:#1a1a1a; color:white; border:none; border-radius:10px; font-size:16px; font-weight:bold; cursor:pointer; transition:transform 0.1s;`;
  startBtn.onmousedown = () => startBtn.style.transform = "scale(0.98)";
  startBtn.onmouseup = () => startBtn.style.transform = "scale(1)";

  startBtn.onclick = () => {
    overlay.remove();
    initiateRecallChallenge(selectedDiff, selectedCount);
  };

  body.appendChild(startBtn);
  box.appendChild(body);
}

// --- QUIZ & OVERLAY SYSTEM ---

function renderPdfButton() {
  // Only manual trigger now
}

// ==========================================

async function initiateRecallChallenge(difficulty = "Moderate", numQuestions = 5) {
  if (document.getElementById('recall-anchor-overlay')) return;

  // 0. SCRAPE CONTEXT (Before UI blocks view)
  let context = "";
  try {
    const centerElement = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    if (centerElement) {
      let target = centerElement;
      while (target && target.tagName !== 'BODY' && target.innerText.length < 500) {
        target = target.parentElement;
      }

      // If we hit BODY, it means we didn't find a specific nearby text block.
      // We must use scroll-based slicing to get relevant text.
      if (!target || target.tagName === 'BODY') {
        const startPoint = Math.max(0, window.scrollY - 800);
        context = document.body.innerText.substring(startPoint, startPoint + 5000);
      } else {
        context = target.innerText;
      }
    } else {
      const startPoint = Math.max(0, window.scrollY - 800);
      context = document.body.innerText.substring(startPoint, startPoint + 5000);
    }
  } catch (e) {
    context = document.body.innerText.substring(0, 2000);
  }
  // Truncate to safe limit
  context = context.substring(0, 2000);

  // 1. Show Loading State
  const overlay = createBaseOverlay('recall-anchor-overlay');
  document.documentElement.appendChild(overlay);

  const isDark = currentTheme === 'dark';
  const textColor = isDark ? '#e0e0e0' : '#333';
  const subTextColor = isDark ? '#aaa' : '#888';

  const contentBox = overlay.querySelector('#recall-content-box');

  // Close Button for Loading/Quiz
  const closeBtn = document.createElement('div');
  closeBtn.innerHTML = "&times;";
  closeBtn.style.cssText = `
    position:absolute; top:10px; right:15px; 
    font-size:24px; cursor:pointer; color:${subTextColor}; 
    line-height:1; z-index:10; transition:color 0.2s;
  `;
  closeBtn.onmouseover = () => closeBtn.style.color = '#ffa500';
  closeBtn.onmouseout = () => closeBtn.style.color = subTextColor;
  closeBtn.onclick = () => overlay.remove();

  // Create wrapper to hold close button + dynamic content
  const wrapper = document.createElement('div');
  wrapper.style.height = "100%";
  wrapper.appendChild(closeBtn); // Always present

  // Inject Spinner Styles
  const spinnerStyle = document.createElement('style');
  spinnerStyle.textContent = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .recall-spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #ffa500;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px auto;
    }
  `;
  overlay.appendChild(spinnerStyle);

  const loadingBody = document.createElement('div');
  loadingBody.style.padding = "40px";
  loadingBody.innerHTML = `
      <div class="recall-spinner"></div>
      <h3 style="color:${textColor}; margin:0;">Generating Challenge...</h3>
      <p style="color:${subTextColor}; font-size:12px;">Difficulty: ${difficulty} | Questions: ${numQuestions}</p>
      <p style="color:#aaa; font-size:11px; margin-top:10px;">Reading context & crafting questions...</p>
  `;
  wrapper.appendChild(loadingBody);
  contentBox.appendChild(wrapper);

  // 2. Context already scraped at step 0

  // 3. Ask AI
  chrome.runtime.sendMessage({
    action: "generateQuiz",
    context: context,
    difficulty: difficulty,
    numQuestions: numQuestions
  }, (response) => {
    // Check for API errors reported by offscreen or runtime errors
    if (chrome.runtime.lastError || !response || response.error || !response.quiz || !response.quiz.quizzes) {
      console.warn("Recall Anchor: AI Generation Failed", chrome.runtime.lastError, response);

      const errorMsg = response?.error || chrome.runtime.lastError?.message || "AI Connection Failed";

      wrapper.innerHTML = ''; // Clear loading
      wrapper.appendChild(closeBtn); // Re-add close btn

      const errDiv = document.createElement('div');
      errDiv.style.padding = "30px";
      errDiv.innerHTML = `
        <h3 style="color:#d32f2f; margin-top:0;">Connection Error</h3>
        <p style="color:${subTextColor}; font-size:13px; margin-bottom:20px;">${errorMsg}</p>
        <button id="closeErrorBtn" style="padding:8px 20px; background:#ddd; color:${textColor}; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">Close</button>
      `;
      wrapper.appendChild(errDiv);

      document.getElementById('closeErrorBtn').onclick = () => {
        document.getElementById('recall-anchor-overlay').remove();
      };
    } else {
      // Render Timer & MCQ
      renderMCQMode(contentBox, response.quiz.quizzes);
    }
  });
}

function createBaseOverlay(id) {
  const overlay = document.createElement('div');
  overlay.id = id;
  overlay.style.cssText = `
    position:fixed; top:0; left:0; width:100vw; height:100vh; 
    background:rgba(0,0,0,0.8); z-index:2147483647; 
    display:flex; justify-content:center; align-items:center; 
    backdrop-filter:blur(5px); opacity:0; transition:opacity 0.4s ease-in-out;
  `;

  const isDark = currentTheme === 'dark';
  const boxBg = isDark ? '#1e1e1e' : '#fff';
  const boxBorder = isDark ? '#333' : '#eee';

  const box = document.createElement('div');
  box.id = 'recall-content-box';
  box.style.cssText = `
    background:${boxBg}; width:450px; min-height:300px; 
    border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,0.3); 
    text-align:center; font-family:'Segoe UI', sans-serif; 
    position:relative; border: 1px solid ${boxBorder}; overflow:hidden;
    transform: translate3d(0, 20px, 0); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  `;

  overlay.appendChild(box);

  // Animation In
  setTimeout(() => {
    overlay.style.opacity = '1';
    box.style.transform = 'translate3d(0,0,0)';
  }, 50);

  return overlay;
}

function renderMCQMode(container, quizzes) {
  let currentQ = 0;
  const isDark = currentTheme === 'dark';

  // Theme Colors
  const headerBg = isDark ? '#2c2c2c' : '#fafafa';
  const headerBorder = isDark ? '#333' : '#eee';
  const textColor = isDark ? '#e0e0e0' : '#333';
  const optionBg = isDark ? '#2c2c2c' : 'white';
  const optionBorder = isDark ? '#444' : '#ddd';
  const optionTx = isDark ? '#ccc' : '#555';

  const renderQuestion = () => {
    const q = quizzes[currentQ];
    container.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.style.cssText = `background:${headerBg}; padding: 15px; border-bottom: 1px solid ${headerBorder}; display: flex; justify-content: space-between; align-items: center; position: relative;`;
    header.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
         <span style="font-weight:bold; color:#ffa500;">Recall Check</span> 
         <span style="font-size:12px; color:${optionTx}; opacity:0.7;">${currentQ + 1}/${quizzes.length}</span>
      </div>
      <div id="quizCloseBtn" style="cursor:pointer; color:${optionTx}; font-size:20px; font-weight:bold; line-height:0.8; padding:5px;">&times;</div>
    `;

    // Close logic for MCQ
    setTimeout(() => {
      const close = header.querySelector('#quizCloseBtn');
      if (close) close.onclick = () => container.parentNode.remove(); // container is box, parent is overlay
    }, 0);

    // Question
    const body = document.createElement('div');
    body.style.cssText = "padding:25px;";

    const h3 = document.createElement('h3');
    h3.innerText = q.question;
    h3.style.cssText = `font-size: 18px; font-weight: 700; color:${textColor}; margin: 0 0 20px 0; line-height: 1.4;`;

    const optionsDiv = document.createElement('div');
    optionsDiv.style.cssText = "display:flex; flex-direction:column; gap:10px;";

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.innerText = opt;
      // Improved Dark Mode Contrast
      const btnBg = isDark ? '#3a3a3a' : 'white'; // Ligher dark gray
      const btnTx = isDark ? '#ffffff' : '#555'; // Pure white text
      const btnBorderColor = isDark ? '#555' : '#ddd';

      btn.style.cssText = `
        padding: 12px;
        border: 1px solid ${btnBorderColor};
        border-radius: 8px;
        background:${btnBg};
        color:${btnTx};
        cursor: pointer;
        text-align: left;
        font-size: 14px;
        width: 100%;
        white-space: normal;
        word-wrap: break-word;
        line-height: 1.4;
        transition:all 0.2s;
        box-shadow: ${isDark ? '0 2px 4px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.05)'};
      `;

      btn.onmouseover = () => {
        btn.style.borderColor = "#ffa500";
        if (isDark) btn.style.background = "#444";
      };
      btn.onmouseout = () => {
        btn.style.borderColor = btnBorderColor;
        btn.style.background = btnBg;
      };

      btn.onclick = () => {
        // Validation
        if (idx === q.correctIndex) {
          btn.style.background = isDark ? '#155724' : "#d4edda";
          btn.style.borderColor = isDark ? '#28a745' : "#c3e6cb";
          btn.style.color = isDark ? '#fff' : "#155724";
          setTimeout(() => {
            if (currentQ < quizzes.length - 1) {
              currentQ++;
              renderQuestion();
            } else {
              closeOverlayWithSuccess(container);
            }
          }, 800);
        } else {
          btn.style.background = isDark ? '#721c24' : "#f8d7da";
          btn.style.borderColor = isDark ? '#dc3545' : "#f5c6cb";
          btn.style.color = isDark ? '#fff' : "#721c24";
          btn.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(0)' }], { duration: 300 });
        }
      };

      optionsDiv.appendChild(btn);
    });

    body.appendChild(h3);
    body.appendChild(optionsDiv);

    container.appendChild(header);
    container.appendChild(body);
  };

  renderQuestion();
}



function closeOverlayWithSuccess(container) {
  container.innerHTML = `
    <div style="height:300px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
       <div style="font-size:50px;">🏆</div>
       <h2 style="color:#2ecc71; margin:10px 0;">Legendary!</h2>
       <p style="color:#888;">Focus restored.</p>
    </div>
    `;
  setTimeout(() => {
    const overlay = document.getElementById('recall-anchor-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 400);
    }
  }, 1500);
}


// ==========================================

// 6. BUDDY OVERLAY
function showBuddyOverlay(goal) {
  if (!isValid() || document.getElementById("focus-buddy-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "focus-buddy-overlay";
  overlay.style.cssText = `
    position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(18, 18, 18, 0.98); z-index: 2147483647; display: flex;
    flex-direction: column; align-items: center; justify-content: center;
    color: white; font-family: 'Segoe UI', Tahoma, sans-serif; text-align: center; padding: 20px;
  `;

  const buddyBox = document.createElement('div');
  buddyBox.id = "buddyBox";
  Object.assign(buddyBox.style, {
    maxWidth: "550px", border: "2px solid #ffa500", padding: "40px",
    borderRadius: "24px", background: "#1e1e1e", boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
  });

  const h1 = document.createElement('h1');
  h1.innerText = "Hey buddy, I'm just looking out for you.";
  h1.style.cssText = "color: #ffa500; margin-bottom: 15px; font-size: 28px;";

  const p1 = document.createElement('p');
  p1.style.cssText = "font-size: 18px; color: #e0e0e0; margin-bottom: 10px;";
  p1.innerText = "";
  p1.append("You said you wanted to focus on ");
  const strong = document.createElement('strong'); strong.innerText = `"${goal}"`;
  p1.append(strong);
  p1.append(".");

  const p2 = document.createElement('p');
  p2.style.cssText = "color: #bbb; font-size: 15px; line-height: 1.6; margin-bottom: 25px; padding: 0 10px;";
  p2.innerText = "Once you enter this site, time may fly and we won't be able to recover that delay. Take 10 seconds to breathe—is this really where you want to be right now? I'm trying to help you, not hold you back.";

  const btnContainer = document.createElement('div');
  btnContainer.style.cssText = "display: flex; gap: 15px; justify-content: center; margin-top: 10px;";

  const backBtn = document.createElement('button');
  backBtn.id = "backToWorkBtn";
  backBtn.innerText = "GET ME BACK TO WORK";
  backBtn.style.cssText = "padding: 14px 28px; background: #ffa500; border: none; border-radius: 10px; font-weight: 800; cursor: pointer; color: #000; font-size: 14px; text-transform: uppercase; transition: transform 0.2s;";

  const accessBtn = document.createElement('button');
  accessBtn.id = "accessBtn";
  accessBtn.disabled = true;
  accessBtn.style.cssText = "padding: 14px 28px; background: transparent; border: 1px solid #444; border-radius: 10px; color: #666; cursor: not-allowed; font-size: 13px;";
  // "Wait <span id='buddyTimer'>10</span>s..."
  accessBtn.append("Wait ");
  const timerSpan = document.createElement('span');
  timerSpan.id = "buddyTimer";
  timerSpan.innerText = "10";
  accessBtn.append(timerSpan);
  accessBtn.append("s...");

  btnContainer.appendChild(backBtn);
  btnContainer.appendChild(accessBtn);

  buddyBox.appendChild(h1);
  buddyBox.appendChild(p1);
  buddyBox.appendChild(p2);
  buddyBox.appendChild(btnContainer);

  overlay.appendChild(buddyBox);

  document.documentElement.appendChild(overlay);

  let t = 10;
  const int = setInterval(() => {
    if (!isValid()) { clearInterval(int); return; }
    t--;
    const el = document.getElementById("buddyTimer");
    if (el) el.innerText = t;
    if (t <= 0) {
      clearInterval(int);
      const btn = document.getElementById("accessBtn");
      if (btn) {
        btn.disabled = false;
        btn.innerText = "I've thought about it, let me in";
        btn.style.color = "#aaa";
        btn.style.borderColor = "#666";
        btn.style.cursor = "pointer";
      }
    }
  }, 1000);

  // THE REWARD REDIRECT
  document.getElementById("backToWorkBtn").onclick = () => {
    const box = document.getElementById("buddyBox");
    box.style.transform = "scale(0.95)";
    box.innerHTML = '';
    const h1Reward = document.createElement('h1');
    h1Reward.innerText = "Legendary Choice!";
    h1Reward.style.cssText = "color: #2ecc71; font-size: 32px;";

    const pReward = document.createElement('p');
    pReward.style.cssText = "font-size: 18px; color: #fff;";
    pReward.append("Returning to your path: ");
    const strongReward = document.createElement('strong');
    strongReward.innerText = goal;
    pReward.append(strongReward);

    box.appendChild(h1Reward);
    box.appendChild(pReward);
    box.style.borderColor = "#2ecc71";

    fireRibbons('big'); // Explosive reward!

    setTimeout(() => {
      window.location.href = "https://www.google.com";
    }, 2500);
  };

  document.getElementById("accessBtn").onclick = () => {
    isDistractionMode = true; // Stay expanded
    overlay.remove();
  };
}

function fireRibbons(type) {
  if (!isValid() || document.hidden) return;
  document.getElementById("celebration-canvas")?.remove();
  const canvas = document.createElement('canvas');
  canvas.id = "celebration-canvas";
  Object.assign(canvas.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: '2147483647' });
  document.documentElement.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  let p = []; for (let i = 0; i < (type === 'big' ? 100 : 35); i++) { p.push({ x: Math.random() * canvas.width, y: -20, w: Math.random() * 8 + 4, h: Math.random() * 15 + 5, c: `hsl(${Math.random() * 360}, 80%, 60%)`, s: Math.random() * 5 + 3, r: Math.random() * 360, rs: Math.random() * 12 - 6 }); }
  function anim() {
    if (!isValid()) return; ctx.clearRect(0, 0, canvas.width, canvas.height); let v = false;
    p.forEach(particle => { particle.y += particle.s; particle.r += particle.rs; if (particle.y < canvas.height) { v = true; ctx.save(); ctx.translate(particle.x, particle.y); ctx.rotate(particle.r * Math.PI / 180); ctx.fillStyle = particle.c; ctx.fillRect(-particle.w / 2, -particle.h / 2, particle.w, particle.h); ctx.restore(); } });
    if (v) requestAnimationFrame(anim); else canvas.remove();
  } anim();
}

// 8. MASTER MESSAGE LISTENER
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!isValid()) return;

  if (request.action === "requestContext") {
    const bodySnippet = document.body ? document.body.innerText.substring(0, 1000) : "";
    sendResponse({ context: { title: document.title, bodySnippet: bodySnippet } });
  }
  else if (request.action === "showOverlay") {
    showBuddyOverlay(request.goal);
    sendResponse({ status: "ok" });
  }
  else if (request.action === "showIntervention") {
    activeGoalText = request.goal; isDistractionMode = true; isNudgeActive = true;
    renderFocusBubble(request.goal, true);
    renderOrangeFlash(request.goal);
    expandBubble();
    bodyguard.observe(document.documentElement, { childList: true, subtree: true });
    sendResponse({ status: "ok" });
  }
  else if (request.action === "clearIntervention") {
    isDistractionMode = false;
    collapseBubble();
    document.getElementById("focus-bridge-glow-top")?.remove();
    document.getElementById("focus-buddy-overlay")?.remove();
    sendResponse({ status: "ok" });
  }
  else if (request.action === "fireRibbons") {
    fireRibbons(request.type);
    sendResponse({ status: "ok" });
  }
  else if (request.action === "broadcastClear" || request.action === "broadcastEndSession") {
    isNudgeActive = false;
    isDistractionMode = false;
    stopRecallMonitoring();
    bodyguard.disconnect();
    document.getElementById("focus-bubble-root")?.remove();
    document.getElementById("focus-bridge-glow-top")?.remove();
    document.getElementById("focus-buddy-overlay")?.remove();
    document.getElementById("recall-anchor-overlay")?.remove();
    sendResponse({ status: "ok" });
  }
  else if (request.action === "updateRecallState") {
    recallActive = request.active;
    sendResponse({ status: "ok" });
  }
  else if (request.action === "triggerRecallTest") {
    renderRecallSetupModal();
    sendResponse({ status: "ok" });
  }
  // No return true needed unless we have an actual async operation not covered here

});

// 9. INITIAL LOAD
chrome.storage.local.get(['sessionActive', 'userGoal', 'recallActive'], (res) => {
  if (!isValid()) return;

  // FOCUS SESSION (Dependent)
  if (res.sessionActive) {
    isNudgeActive = true;
    activeGoalText = res.userGoal;

    // Spawn as a circle (safe) by default on load
    renderFocusBubble(res.userGoal, false);
    bodyguard.observe(document.documentElement, { childList: true, subtree: true });
  }

  // RECALL ANCHOR (Independent of Session)
  recallActive = !!res.recallActive;
  // No auto-start monitoring anymore
});

// 10. THEME SYNC
chrome.storage.onChanged.addListener((changes) => {
  if (isValid() && changes.theme) updateBubbleTheme(changes.theme.newValue);
  if (isValid() && changes.recallActive) {
    recallActive = changes.recallActive.newValue;
  }
});

// 11. CONFETTI CELEBRATION
// 11. CONFETTI CELEBRATION
function launchConfetti(type = 'finish') {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:999999;";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#ffa500'];

  // Adjust count based on type: 'finish' = big burst, 'milestone' = gentle shower
  const count = type === 'finish' ? 150 : 80;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height, // Start above screen
      vx: Math.random() * 4 - 2,   // Faster drift
      vy: Math.random() * 5 + 3,   // Faster fall (3-8px/frame)
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      wobble: Math.random() * Math.PI * 2
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach(p => {
      p.x += p.vx + Math.sin(p.wobble) * 0.5; // Add sway
      p.y += p.vy;
      p.wobble += 0.05;

      if (p.y < canvas.height) active = true;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    if (active) requestAnimationFrame(animate);
    else canvas.remove();
  }
  animate();
}

// 12. MESSAGE LISTENER EXTENSION
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "fireConfetti") {
    launchConfetti(msg.type);
  }

  if (msg.action === "clearIntervention") {
    // Existing logic might be elsewhere, but let's ensure cleanup here too
    const flash = document.getElementById("focus-bridge-glow-top");
    if (flash) flash.remove();

    // Also remove any overlays if present
    const overlay = document.getElementById("focus-overlay-root");
    if (overlay) overlay.remove();
  }
});