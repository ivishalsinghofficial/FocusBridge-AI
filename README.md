
# FocusBridge AI 🎯

### *The Privacy-First, Mindful Productivity Engine for Modern Browsers*

[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest_V3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Local AI](https://img.shields.io/badge/AI-Transformers.js-blue.svg)](https://github.com/xenova/transformers.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**FocusBridge AI** is not just another site blocker. It is a cognitive safety net designed to bridge the gap between your **intentions** and your **actions**. By leveraging on-device Small Language Models (SLMs), it understands the *context* of your browsing habits and provides "Soft Friction" to keep you aligned with your goals.

### Download

<a href="https://chromewebstore.google.com/search/FocusBridge%20AI%3A%20Smart%20Nudge%20for%20ADHD%20%26%20Deep%20Work">
  <img src="https://developer.chrome.com/static/docs/webstore/branding/image/UV4C4ybeBTsZt43U4xis.png" alt="Available in the Chrome Web Store" height="60">
</a>

<div style="font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif; border: 1px solid rgb(224, 224, 224); border-radius: 12px; padding: 20px; max-width: 500px; background: rgb(255, 255, 255); box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 8px;"><div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;"><img alt="FocusBridge AI" src="https://ph-files.imgix.net/d23a868a-d2f3-4594-8713-6833ac8cb33d.png?auto=format&amp;fit=crop&amp;w=80&amp;h=80" style="width: 64px; height: 64px; border-radius: 8px; object-fit: cover; flex-shrink: 0;"><div style="flex: 1 1 0%; min-width: 0px;"><h3 style="margin: 0px; font-size: 18px; font-weight: 600; color: rgb(26, 26, 26); line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">FocusBridge AI</h3><p style="margin: 4px 0px 0px; font-size: 14px; color: rgb(102, 102, 102); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">Smart Nudge for ADHD &amp; Deep Work</p></div></div><a href="https://www.producthunt.com/products/focusbridge-ai?embed=true&amp;utm_source=embed&amp;utm_medium=post_embed" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 4px; margin-top: 12px; padding: 8px 16px; background: rgb(255, 97, 84); color: rgb(255, 255, 255); text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Check it out on Product Hunt →</a></div>

---

## 🚀 The Problem
Most productivity tools are binary: they either block a site or they don't. This creates "Reactance," where users feel restricted and eventually disable the tool. **FocusBridge AI** solves this through **Mindful Friction**—forcing a 10-second conscious pause only when your current tab deviates from your stated goal.

## ✨ Key Features

### 🧠 Semantic Intent Analysis
Uses **Transformers.js** to run a local `all-MiniLM-L6-v2` model. It performs real-time Cosine Similarity checks between your goal and the content of the active tab. It understands that "Space Research" is relevant to NASA, but "Cat Memes" on Reddit is a distraction.

### 🛡️ The "Buddy" Intervention
When a distraction is detected on a restricted domain, a full-screen **Mindful Overlay** appears. 
- **The Forced Pause:** A 10-second timer disables the "Access Site" button, forcing your brain to switch from impulsive browsing to rational decision-making.
- **Hero Rewards:** Choosing to "Get Back to Work" triggers an explosive particle celebration—rewarding self-discipline with dopamine.

### 🫧 Fluid Focus Bubble
A draggable, hardware-accelerated floating UI that lives on your screen.
- **Dynamic States:** Collapses into a minimalist Pomodoro progress ring on safe sites; auto-expands into a high-contrast Goal Card on distracting sites.
- **Edge-Snapping:** Intelligently snaps to the edges of your viewport and hides 50% of its body to stay out of your workspace.

### 📊 Digital Wellbeing Dashboard
- **Android-style Stats:** Visualizes your "Productive vs. Neutral" time using **Chart.js**.
- **7-Day History:** Local time-series data retention to track focus trends over a week.
- **31-Day Discipline Blueprint:** A month's worth of curated, deep-dive stories of history's most disciplined figures (Kobe Bryant, Marie Curie, etc.) to prime your mindset before you start.

---

## 🔒 Privacy Architecture
**FocusBridge AI is 100% Private.**
- **Zero Data Exfiltration:** Analysis is performed locally using WebAssembly.
- **No API Keys Required:** No connection to OpenAI or Google servers.
- **Local Storage:** Your browsing history and goals never leave your machine.

---

## 🛠️ Tech Stack
- **Extension Framework:** Manifest V3 (Service Workers)
- **AI Engine:** Transformers.js (ONNX Runtime)
- **Visualization:** Chart.js
- **UI/UX:** Canvas API (Particle Physics), CSS3 Transitions (Hardware Accelerated), MutationObserver (Self-Healing DOM)
- **Communication:** Asynchronous Message Passing & Offscreen API

---

## ⚙️ Installation (Developer Mode)
1. Clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer Mode** (top right).
4. Click **Load Unpacked** and select the project folder.
5. *Note:* Ensure you have `chart.js` and `transformers.js` in the root directory.

---

## 👨‍💻 Engineering Highlights (For Recruiters)
- **Performance Optimization:** Implemented quad-quadrant rendering and `translate3d` transforms to maintain 60FPS on high-resource sites like YouTube and Figma.
- **Robustness:** Built a "Self-Healing UI" using the MutationObserver API to counteract DOM-wiping in modern Single Page Applications (SPAs).
- **Architecture:** Leveraged the **Offscreen API** to execute high-compute WASM tasks without violating the strict Content Security Policies (CSP) of Manifest V3.

---

## ☕ Support
If this tool helped you master your focus, consider supporting the developer!
