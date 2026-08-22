import { pipeline, env } from './transformers.js';

// 1. Point to the CDN for the WASM engines (This is more reliable than local)
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/';

// 2. Standard settings for Chrome Extensions
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.simd = false;

let extractor;

function dataUrlToBlob(dataUrl) {
    const match = /^data:([^;,]+);base64,(.+)$/.exec(dataUrl);
    if (!match) throw new Error('Invalid screenshot image data.');
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: match[1] });
}

async function init() {
    if (extractor) return;
    try {
        //console.log("AI: Loading engine from CDN...");

        // This downloads the model weights from HuggingFace
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

        //console.log("AI: Engine is ready and model is loaded!");
    } catch (e) {
        console.error("AI: Initialization failed!", e);
    }
}

// Math for comparing vectors
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) || 0;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 1. STRICT FILTER: Only handle messages meant for offscreen
    if (message.target !== 'offscreen' && message.target !== 'offscreen-recall' && message.target !== 'offscreen-api' && message.target !== 'offscreen-clipboard') {
        return false; // Explicitly decline handling
    }

    // 2. Dispatch Async Handler
    (async () => {
        try {
            if (message.target === 'offscreen-clipboard') {
                const blob = dataUrlToBlob(message.dataUrl);
                await navigator.clipboard.write([
                    new ClipboardItem({ [blob.type]: blob })
                ]);
                sendResponse({ success: true });
                return;
            }

            if (message.target === 'offscreen-api') {
                const { subAction, provider, key, context } = message;

                if (subAction === 'verify') {
                    const result = await testApiConnection(provider, key);
                    sendResponse(result);
                } else if (subAction === 'generate') {
                    try {
                        const quiz = await generateQuiz(provider, key, context, message.difficulty, message.numQuestions);
                        sendResponse({ quiz: quiz });
                    } catch (e) {
                        sendResponse({ error: "Offscreen Gen Error: " + e.message });
                    }
                }
                return;
            }

            // Standard Embeddings Logic
            if (!extractor) await init();
            if (!extractor) return;

            // SCOPE 1: Standard AI Scraper
            if (message.target === 'offscreen') {
                const goalOutput = await extractor(message.goal, { pooling: 'mean', normalize: true });
                const pageOutput = await extractor(message.title, { pooling: 'mean', normalize: true });

                const score = cosineSimilarity(Array.from(goalOutput.data), Array.from(pageOutput.data));

                chrome.runtime.sendMessage({
                    target: 'background',
                    score: score,
                    tabId: message.tabId,
                    goal: message.goal
                });
            }
            // SCOPE 2: Recall Anchor Validation
            else if (message.target === 'offscreen-recall') {
                const summaryVec = await extractor(message.userSummary.toLowerCase(), { pooling: 'mean', normalize: true });
                const snippetVec = await extractor(message.pageSnippet.toLowerCase(), { pooling: 'mean', normalize: true });

                const score = cosineSimilarity(Array.from(summaryVec.data), Array.from(snippetVec.data));

                chrome.runtime.sendMessage({
                    target: 'background-recall',
                    reqId: message.reqId,
                    score: score
                });
            }
        } catch (err) {
            console.error("AI: Fatal Offscreen Error", err?.name, err?.message, err);
            if (message.target === 'offscreen-api' || message.target === 'offscreen-clipboard') {
                sendResponse({ success: false, error: err?.message || err?.name || 'Clipboard write failed.' });
            } else if (message.target === 'offscreen-recall') {
                chrome.runtime.sendMessage({
                    target: 'background-recall',
                    reqId: message.reqId,
                    error: err.message
                });
            }
        }
    })();

    return true; // Keep channel open ONLY for matched messages
});

// --- API IMPLEMENTATION ---

async function testApiConnection(provider, key) {
    try {
        if (provider === 'gemini') {
            // Use Stable Model for Verification
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Say 'Hello'" }] }]
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                // console.warn("Gemini Verification Failed:", JSON.stringify(errData, null, 2));
                return { success: false, error: errData.error?.message || `Error ${res.status}` };
            }
            return { success: true };

        } else if (provider === 'chatgpt') {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini", // Use Stable Model for Verification
                    messages: [{ role: "user", content: "Say Hello" }],
                    max_tokens: 5
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                // console.warn("ChatGPT Verification Failed:", JSON.stringify(errData, null, 2));
                return { success: false, error: errData.error?.message || `Error ${res.status}` };
            }
            return { success: true };
        }
    } catch (e) {
        console.error("API verification exception:", e);
        return { success: false, error: e.message || "Network Error" };
    }
    return { success: false, error: "Unknown Provider" };
}

async function generateQuiz(provider, key, context, difficulty = "Moderate", numQuestions = 5) {
    const prompt = `Act as a focus coach. Based on this text, generate ${numQuestions} Multiple Choice Questions to test understanding. 
    Difficulty Level: ${difficulty} (Adjust complexity accordingly).
    Text: "${context.substring(0, 2000)}..." 
    Output ONLY raw JSON (no markdown): {"quizzes": [{"question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0}]}`;

    // Helper to try fetch
    const tryFetch = async (model) => {
        let url, body;
        if (provider === 'gemini') {
            url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
            body = { contents: [{ parts: [{ text: prompt }] }] };
        } else {
            url = 'https://api.openai.com/v1/chat/completions';
            body = {
                model: model,
                messages: [{ role: "user", content: prompt }]
            };
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(provider === 'chatgpt' ? { 'Authorization': `Bearer ${key}` } : {})
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || `API Error ${res.status}`);
        }

        const data = await res.json();
        return provider === 'gemini'
            ? data.candidates?.[0]?.content?.parts?.[0]?.text
            : data.choices?.[0]?.message?.content;
    };

    try {
        let jsonStr;
        try {
            // 1. Try Stable Model (Gemini 2.5 Series / GPT-4o-mini)
            const primaryModel = provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini';
            jsonStr = await tryFetch(primaryModel);
        } catch (e) {
            console.warn("Primary model failed, trying secondary...", e);
            try {
                // 2. Try Experimental/Preview Model (Gemini 3 Series / GPT-5-mini)
                const secondaryModel = provider === 'gemini' ? 'gemini-3-flash-preview' : 'gpt-5-mini-2025-08-07';
                jsonStr = await tryFetch(secondaryModel);
            } catch (e2) {
                console.warn("Secondary model failed, trying tertiary...", e2);
                // 3. Fallback to Stable Model (Legacy)
                const tertiaryModel = provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-3.5-turbo';
                jsonStr = await tryFetch(tertiaryModel);
            }
        }

        // Clean JSON
        if (jsonStr) {
            jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
            return { quizzes: JSON.parse(jsonStr).quizzes };
        }
    } catch (e) {
        console.error("Quiz generation failed:", e);
        return { error: e.message };
    }
    return { error: "Unknown Generation Error" };
}
