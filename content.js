/**
 * CONTENT.JS - FocusBridge AI (Robust + Elastic UI Edition)
 */

let activeGoalText = "";
let isDistractionMode = false;
let isNudgeActive = false;
let currentTheme = 'light';

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
  bubble.style.color = isDark ? "#ffffff" : "#1a1a1a";
  bubble.style.borderColor = isDark ? "#333" : "#ddd";

  const goalText = document.getElementById("bubbleGoalText");
  if (goalText) goalText.style.color = "#000";
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

// 4. RENDER THE FLUID BUBBLE (FIXED: Elastic width + Zero-Hiccup spawn)
function renderFocusBubble(goal, isDistracted = false) {
  if (document.getElementById("focus-bubble-root")) return;
  activeGoalText = goal;

  const bubble = document.createElement("div");
  bubble.id = "focus-bubble-root";

  // Decide initial shape based on distraction state
  const initialWidth = isDistracted ? "auto" : "60px";
  const initialRadius = isDistracted ? "12px" : "30px";

  Object.assign(bubble.style, {
    position: "fixed", bottom: "30px", right: "30px",
    width: initialWidth, height: "60px",
    minWidth: isDistracted ? "140px" : "60px",
    maxWidth: "280px",
    zIndex: "2147483647", cursor: "grab", borderRadius: initialRadius,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)", userSelect: "none", overflow: "hidden",
    border: "2px solid #ddd", background: "#fff",
    // Disable transition initially to prevent the "circle-to-box" growth flicker
    transition: "none"
  });

  // Create Pomo Container (State 1)
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
  circleBg.setAttribute("stroke", "rgba(128,128,128,0.1)"); circleBg.setAttribute("stroke-width", "3");
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
  minsSpan.style.cssText = "font-size: 14px; font-weight: 800; font-family: sans-serif;";
  minsSpan.innerText = "--";

  pomoContainer.appendChild(svg);
  pomoContainer.appendChild(minsSpan);

  // Create Content Container (State 2)
  const bubbleContent = document.createElement('div');
  bubbleContent.id = "bubbleContent";
  Object.assign(bubbleContent.style, {
    display: isDistracted ? 'block' : 'none', padding: "0 15px", whiteSpace: "nowrap", textAlign: "center"
  });

  const targetLabel = document.createElement('div');
  targetLabel.innerText = "Target";
  targetLabel.style.cssText = "font-size:8px; font-weight:800; color:#ffa500; text-transform:uppercase; margin-bottom:3px; letter-spacing:1px;";

  const goalTextEl = document.createElement('div');
  goalTextEl.id = "bubbleGoalText";
  goalTextEl.innerText = goal;
  goalTextEl.style.cssText = "color: #000; font-weight: 800; font-size: 13px; background: #ffa500; padding: 5px 12px; border-radius: 6px; display: inline-block;";

  bubbleContent.appendChild(targetLabel);
  bubbleContent.appendChild(goalTextEl);

  bubble.appendChild(pomoContainer);
  bubble.appendChild(bubbleContent);

  document.documentElement.appendChild(bubble);

  // Turn transitions back on after a tiny delay so future hovers remain smooth
  setTimeout(() => {
    if (bubble) bubble.style.transition = "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s, border-radius 0.3s";
  }, 50);

  bubble.onmouseenter = () => { if (isValid() && !isDistractionMode) expandBubble(); };
  bubble.onmouseleave = () => { if (isValid() && !isDistractionMode) collapseBubble(); };

  let isDragging = false;
  bubble.onmousedown = (e) => {
    if (!isValid()) return;
    isDragging = true;
    let startX = e.clientX - bubble.offsetLeft;
    let startY = e.clientY - bubble.offsetTop;

    document.onmousemove = (e) => {
      if (!isDragging) return;
      bubble.style.left = (e.clientX - startX) + 'px';
      bubble.style.top = (e.clientY - startY) + 'px';
      bubble.style.right = 'auto'; bubble.style.bottom = 'auto';
    };

    document.onmouseup = () => { isDragging = false; document.onmousemove = null; };
  };

  chrome.storage.local.get(['theme'], (res) => {
    if (isValid()) updateBubbleTheme(res.theme || 'light');
  });
}

function expandBubble() {
  const bubble = document.getElementById("focus-bubble-root");
  const pomo = document.getElementById("pomoContainer");
  const content = document.getElementById("bubbleContent");
  if (!bubble) return;

  bubble.style.width = "auto";
  bubble.style.minWidth = "160px";
  bubble.style.borderRadius = "12px";

  if (pomo) pomo.style.display = isDistractionMode ? "none" : "flex";
  if (content) content.style.display = "block";
}

function collapseBubble() {
  const bubble = document.getElementById("focus-bubble-root");
  const pomo = document.getElementById("pomoContainer");
  const content = document.getElementById("bubbleContent");
  if (bubble && !isDistractionMode) {
    bubble.style.width = "60px";
    bubble.style.minWidth = "60px";
    bubble.style.borderRadius = "30px";
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
  p1.innerHTML = `You said you wanted to focus on <strong>"${goal}"</strong>.`; // Text + Strong is usually ok, but let's be safer:
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
  }
  else if (request.action === "showIntervention") {
    activeGoalText = request.goal; isDistractionMode = true; isNudgeActive = true;

    // SPAWN INSTANTLY AS A BOX (No circle hiccup)
    renderFocusBubble(request.goal, true);
    renderOrangeFlash(request.goal);
    expandBubble();
    bodyguard.observe(document.documentElement, { childList: true, subtree: true });
  }
  else if (request.action === "clearIntervention") {
    isDistractionMode = false;
    collapseBubble();
    document.getElementById("focus-bridge-glow-top")?.remove();
    document.getElementById("focus-buddy-overlay")?.remove();
  }
  else if (request.action === "fireRibbons") {
    fireRibbons(request.type);
  }
  else if (request.action === "broadcastClear" || request.action === "broadcastEndSession") {
    isNudgeActive = false;
    isDistractionMode = false;
    bodyguard.disconnect();
    document.getElementById("focus-bubble-root")?.remove();
    document.getElementById("focus-bridge-glow-top")?.remove();
    document.getElementById("focus-buddy-overlay")?.remove();
  }
  return true;
});

// 9. INITIAL LOAD
chrome.storage.local.get(['sessionActive', 'userGoal'], (res) => {
  if (isValid() && res.sessionActive) {
    isNudgeActive = true;
    activeGoalText = res.userGoal;

    // Spawn as a circle (safe) by default on load
    renderFocusBubble(res.userGoal, false);
    bodyguard.observe(document.documentElement, { childList: true, subtree: true });
  }
});

// 10. THEME SYNC
chrome.storage.onChanged.addListener((changes) => {
  if (isValid() && changes.theme) updateBubbleTheme(changes.theme.newValue);
});