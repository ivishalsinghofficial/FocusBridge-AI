import { pipeline, env } from './transformers.js';

// 1. Point to the CDN for the WASM engines (This is more reliable than local)
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/';

// 2. Standard settings for Chrome Extensions
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.simd = false;

let extractor;

async function init() {
    if (extractor) return;
    try {
        console.log("AI: Loading engine from CDN...");
        
        // This downloads the model weights from HuggingFace
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        
        console.log("AI: Engine is ready and model is loaded!");
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

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.target !== 'offscreen') return;

    if (!extractor) await init();
    if (!extractor) return;

    try {
        const goalOutput = await extractor(message.goal, { pooling: 'mean', normalize: true });
        const pageOutput = await extractor(message.title, { pooling: 'mean', normalize: true });

        const score = cosineSimilarity(Array.from(goalOutput.data), Array.from(pageOutput.data));
        
        console.log(`AI Check: "${message.title}" | Score: ${score.toFixed(2)}`);

        chrome.runtime.sendMessage({ 
            target: 'background', 
            score: score, 
            tabId: message.tabId,
            goal: message.goal
        });
    } catch (err) {
        console.error("AI: Analysis failed!", err);
    }
});