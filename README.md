
# FocusBridge AI 🎯

### *The Privacy-First, Mindful Productivity Engine for Modern Browsers*

[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest_V3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Local AI](https://img.shields.io/badge/AI-Transformers.js-blue.svg)](https://github.com/xenova/transformers.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**FocusBridge AI** is not just another site blocker. It is a cognitive safety net designed to bridge the gap between your **intentions** and your **actions**. By leveraging on-device Small Language Models (SLMs), it understands the *context* of your browsing habits and provides "Soft Friction" to keep you aligned with your goals.

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
