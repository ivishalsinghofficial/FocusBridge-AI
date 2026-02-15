# Privacy Policy for FocusBridge AI

**Last Updated: December 2025**

FocusBridge AI is built with a privacy-first philosophy. We believe that your browsing habits are private, and our goal is to help you stay focused without compromising your security.

## 1. Why we request "Broad Host Permissions" (<all_urls>)
When you install FocusBridge AI, you will see a notice saying the extension can "read and change data on all websites." 

**We require this for one specific reason:**
To provide the **"Smart Nudge"** feature. Because you might use any website for your work (from specialized research portals to common tools), the extension needs to be able to verify if your *current* tab matches your *current* goal. 

Without this permission, the AI would be "blind" and could not nudge you when you wander onto a distracting site.

## 2. On-Device AI (Zero Data Collection)
Unlike many other AI tools, FocusBridge AI does **not** send your data to the cloud.
- **Local Analysis:** 100% of the analysis is performed on your own computer using Transformers.js. 
- **No External APIs:** We do not use OpenAI, Google Gemini, or any other cloud-based AI. 
- **Offline First:** Your goals, sub-tasks, and browsing context never leave your machine.

## 3. Data Storage
- **Local Storage:** Your focus history, goals, and rules are stored strictly in your browser's local storage.
- **No Tracking:** We do not use any analytics, tracking pixels, or third-party monitoring scripts.

## 4. Third-Party Sharing
We do not sell, trade, or share your information. Period.

## 5. Open Source Transparency
As an open-source project, our code is fully auditable. You can verify exactly how we handle your data by visiting our [GitHub Repository](https://github.com/ivishalsinghofficial/FocusBridge-AI).

Since you’ve added the **BYOK (Bring Your Own Key)** feature for Gemini and ChatGPT, your `PRIVACY.md` needs to clearly explain that while some data now travels to Google or OpenAI, it is **completely under the user's control** and never touches your servers.

Here is the professional text to add to your `PRIVACY.md`. I’ve organized it into a "What stays local" vs "What goes to AI" format, which builds massive trust.

***

## 6. Remote AI Features (Recall Anchor)
Version 1.0.1 introduces an optional **Recall Anchor** feature. This allows you to use high-fidelity Multiple Choice Questions (MCQs) to verify your focus.

### Bring Your Own Key (BYOK) Model
- **Local Key Storage:** If you choose to use Gemini Pro or ChatGPT, your API keys are stored strictly within your browser's secure local storage (`chrome.storage.local`). The developer of FocusBridge AI has **zero access** to these keys.
- **Direct Communication:** When a quiz is generated, the extension sends a text snippet from your active tab directly to the official Google (Gemini) or OpenAI (ChatGPT) endpoints. No intermediary servers are used.
- **Data Usage:** These snippets are used only for a one-time prompt generation. We recommend reviewing the privacy policies of [Google AI Studio](https://ai.google.dev/support/privacy) and [OpenAI](https://openai.com/policies/privacy-policy) regarding their API data usage.

## 7. What Never Leaves Your Machine
*   **Your Goals & Sub-tasks:** These are private and stored only on your device.
*   **Your Browsing History:** FocusBridge AI analyzes context in real-time but does not maintain a permanent log of your web history on any server.
*   **Analytics:** We do not use third-party tracking (like Google Analytics). Your productivity stats (The "Productivity Wheel") are calculated and stored locally.

## 8. Support & Queries
Mail me at ivishalsinghofficial@gmail.com