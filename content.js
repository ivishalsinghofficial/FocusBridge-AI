/**
 * CONTENT.JS - FocusBridge AI (Robust + Elastic UI Edition + Recall Anchor)
 */

let activeGoalText = "";
let isDistractionMode = false;
let isNudgeActive = false;
let currentTheme = 'dark';
let nudgeBuddyEnabled = false;
let focusUserName = '';
let nudgeBuddyMessagePool = {};
let boostStickersEnabled = true;
let pomoWasActive = false;
let screenshotHoldEnabled = false;
let screenshotToolEnabled = false;
let notepadToolEnabled = false;
let unitConverterToolEnabled = false;
let attentionCheckEnabled = false;
let cleanupToolsDock = null;
let notepadHoldEnabled = false;
let unitConverterHoldEnabled = false;
let nextBravoFontPromise = null;

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

function ensureAttentionCheckAnimation() {
  if (document.getElementById('focusbridge-attention-animation')) return;
  const style = document.createElement('style');
  style.id = 'focusbridge-attention-animation';
  style.textContent = '@keyframes focusbridgeAttentionIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}';
  document.documentElement.appendChild(style);
}

function renderGlobalToolsDock() {
  if (!isValid() || document.getElementById('focusbridge-global-tools-root')) return;
  const host = document.createElement('div');
  host.id = 'focusbridge-global-tools-root';
  host.style.cssText = 'all:initial;position:fixed;z-index:2147483647;top:0;left:0;';
  const shadow = host.attachShadow({ mode: 'closed' });
  shadow.innerHTML = [
    '<style>',
    '*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '#rail{position:fixed;right:-9px;bottom:180px;display:grid;gap:7px}.tool-bubble{appearance:none;display:grid;place-items:center;width:35px;height:32px;border:1px solid rgba(255,255,255,.22);border-radius:999px 0 0 999px;background:rgba(16,17,20,.86);color:#e8c56e;padding:0 9px 0 4px;cursor:pointer;box-shadow:0 9px 21px rgba(0,0,0,.25);font-size:12px;font-weight:700;transition:transform .18s ease,background .2s ease}.tool-bubble svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.tool-bubble:hover{transform:translateX(-3px);background:rgba(43,39,31,.96)}.tool-bubble.attention-active{--attention-background:rgba(109,82,24,.98);--attention-border:rgba(255,224,135,.8);--attention-color:#ffe09a;--attention-glow:rgba(232,197,110,.16);background:var(--attention-background);border-color:var(--attention-border);color:var(--attention-color);animation:attentionPulse 1.8s ease-in-out infinite}.tool-bubble.attention-score-green{--attention-background:rgba(26,61,26,.98);--attention-border:rgba(128,255,128,.88);--attention-color:#b8ffb8;--attention-glow:rgba(128,255,128,.2)}.tool-bubble.attention-score-red{--attention-background:rgba(61,26,26,.98);--attention-border:rgba(255,128,128,.88);--attention-color:#ffb3b3;--attention-glow:rgba(255,128,128,.2)}@keyframes attentionPulse{50%{box-shadow:0 0 0 5px var(--attention-glow),0 9px 21px rgba(0,0,0,.25)}}',
    '#panel,#tool-panel{position:fixed;right:14px;top:50%;width:280px;transform:translate(110%,-50%);padding:16px;color:#f6f3ec;background:rgba(17,18,21,.94);border:1px solid rgba(255,255,255,.18);border-radius:16px;box-shadow:-18px 16px 42px rgba(0,0,0,.34);backdrop-filter:blur(18px);transition:transform .24s cubic-bezier(.2,.8,.2,1)}#panel.open,#tool-panel.open{transform:translate(-68px,-50%)}#tool-panel{display:none;max-height:76vh;overflow:auto}.tool-row{display:flex;gap:7px;align-items:center}.tool-row input,.tool-row select,.tool-textarea{width:100%;border:1px solid rgba(255,255,255,.18);border-radius:9px;background:rgba(0,0,0,.22);color:#fff;padding:9px;font:12px inherit}.tool-row select{color-scheme:dark}.tool-row select option{background:#17181c;color:#f6f3ec}.tool-textarea{height:116px;resize:vertical}.tool-button{appearance:none;border:1px solid rgba(232,197,110,.38);border-radius:8px;background:rgba(215,180,90,.12);color:#f1d58c;padding:7px 9px;cursor:pointer;font:600 12px inherit}.note-list{display:grid;gap:5px;margin-top:9px;max-height:220px;overflow:auto}.note-item{display:flex;gap:6px;align-items:center;width:100%;text-align:left;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:rgba(255,255,255,.04);color:#f6f3ec;padding:7px;cursor:pointer}.note-copy{min-width:0;flex:1}.note-preview{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.note-time{color:#cfc8bb;font-size:10px;margin-top:3px}.note-delete{border:0;background:transparent;color:#d9ae70;cursor:pointer;font-size:16px}.tool-caption{margin:7px 0;color:#cfc8bb;font-size:11px}.tool-tabs{display:flex;gap:5px;margin:9px 0}.tool-tabs button{flex:1}.converter-value{font-size:20px;font-weight:700;color:#f1d58c;text-align:center;margin:11px 0}#tool-panel.notepad-panel{width:min(410px,calc(100vw - 94px));height:min(530px,76vh);padding:22px;overflow:hidden;background:linear-gradient(145deg,rgba(31,29,24,.97),rgba(15,16,19,.97))}#tool-panel.notepad-panel .head{margin-bottom:17px}#tool-panel.notepad-panel .tool-row{margin-bottom:13px}#tool-panel.notepad-panel .tool-textarea{height:245px;resize:none;padding:14px;line-height:26px;background:repeating-linear-gradient(to bottom,rgba(255,255,255,.025) 0,rgba(255,255,255,.025) 25px,rgba(232,197,110,.09) 26px),rgba(32,29,23,.78);border-color:rgba(232,197,110,.27);font-size:14px}#tool-panel.notepad-panel .note-list{max-height:132px;margin-top:10px;padding-right:3px}#tool-panel.notepad-panel .tool-caption{margin:9px 0}#tool-panel.notepad-panel .note-item{padding:9px;background:rgba(255,255,255,.055)}',
    '#tool-panel.notepad-panel{display:flex;flex-direction:column;height:min(580px,82vh)}#tool-panel.notepad-panel .note-actions{margin-bottom:14px}#tool-panel.notepad-panel #clear-note{position:absolute;right:22px;bottom:22px;padding:6px 9px;font-size:11px;background:rgba(215,180,90,.1)}#tool-panel.notepad-panel .note-tab{background:transparent;border-color:transparent;color:#cfc8bb}#tool-panel.notepad-panel .note-tab.active,#tool-panel.notepad-panel #save-note{background:#d7b45a;color:#17140c;border-color:#e8c56e}#tool-panel.notepad-panel .note-view{min-height:0;flex:1;display:flex;flex-direction:column;padding-bottom:32px}#tool-panel.notepad-panel .note-view[hidden]{display:none}#tool-panel.notepad-panel .tool-textarea{height:330px!important;min-height:330px;flex:1;margin:0}#tool-panel.notepad-panel .note-save-row{margin:10px 0 0;justify-content:space-between}#tool-panel.notepad-panel #note-history{gap:10px}#tool-panel.notepad-panel #note-history #note-search{flex:0 0 auto}#tool-panel.notepad-panel #note-history .note-list{max-height:none;flex:1;margin:0;padding-right:3px}#tool-panel.notepad-panel .note-delete{opacity:0}.note-item:hover .note-delete{opacity:1}',
    '.head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}#close{appearance:none;border:0;background:transparent;color:#f6f3ec;cursor:pointer;font-size:21px;line-height:1;padding:0 2px}',
    '#display{width:100%;height:44px;border:1px solid rgba(255,255,255,.18);border-radius:10px;background:rgba(0,0,0,.22);color:#fff;padding:0 12px;margin-bottom:9px;text-align:right;font-size:19px;outline:none}.keys{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}',
    '.key,.action{appearance:none;border:1px solid rgba(255,255,255,.14);border-radius:9px;background:rgba(255,255,255,.07);color:#f8f5ee;min-height:36px;cursor:pointer;font-size:14px}.key:hover,.action:hover{background:rgba(210,178,102,.18);border-color:rgba(223,196,128,.38)}.key.operator{color:#e8c56e}.key.equals{background:#d7b45a;color:#17140c;font-weight:800}.actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:13px}.action{min-height:40px;font-size:12px;font-weight:650}#status{min-height:16px;margin:10px 1px 0;color:#cfc8bb;font-size:11px;text-align:center}@media(max-width:430px){#panel{width:260px}.tool-bubble{padding:9px}.tool-bubble span:last-child{display:none}}',
    '</style><section id="panel" aria-label="FocusBridge tools" aria-hidden="true"><div class="head"><span>Focus tools</span><button id="close" type="button" aria-label="Close tools">×</button></div><input id="display" aria-label="Calculator display" value="0" readonly><div class="keys" aria-label="Calculator">',
    '<button class="key operator" data-key="C">C</button><button class="key operator" data-key="(">(</button><button class="key operator" data-key=")">)</button><button class="key operator" data-key="/">÷</button><button class="key" data-key="7">7</button><button class="key" data-key="8">8</button><button class="key" data-key="9">9</button><button class="key operator" data-key="*">×</button><button class="key" data-key="4">4</button><button class="key" data-key="5">5</button><button class="key" data-key="6">6</button><button class="key operator" data-key="-">−</button><button class="key" data-key="1">1</button><button class="key" data-key="2">2</button><button class="key" data-key="3">3</button><button class="key operator" data-key="+">+</button><button class="key" data-key="0">0</button><button class="key" data-key=".">.</button><button class="key" data-key="back">⌫</button><button class="key equals" data-key="=">=</button>',
    '</div><div id="status" role="status" aria-live="polite"></div></section><div id="rail" aria-label="FocusBridge quick tools"><button id="screenshot" class="tool-bubble" type="button" title="Capture area" aria-label="Capture area"><svg viewBox="0 0 24 24"><path d="M4 8V5h3M16 5h3v3M20 16v3h-3M8 20H5v-3"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg></button><button id="history" hidden type="button" aria-hidden="true"></button></div>'
  ].join('');
  const panel = shadow.querySelector('#panel');
  const rail = shadow.querySelector('#rail');
  const toolPanel = document.createElement('section');
  toolPanel.id = 'tool-panel';
  shadow.append(toolPanel);
  const addToolBubble = (id, title, svg) => {
    const button = document.createElement('button');
    button.id = id; button.className = 'tool-bubble'; button.type = 'button'; button.title = title; button.setAttribute('aria-label', title);
    button.innerHTML = `<svg viewBox="0 0 24 24">${svg}</svg>`; rail.insertBefore(button, shadow.querySelector('#history')); return button;
  };
  const notepadButton = notepadToolEnabled ? addToolBubble('notepad', 'Notepad', '<path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2V3Z"/><path d="M8 7h7M8 11h7M8 15h4M16 17l3-3"/>') : null;
  const converterButton = unitConverterToolEnabled ? addToolBubble('converter', 'Unit converter', '<path d="M4 7h16M7 4v6M17 4v6M4 17h16M7 14v6M17 14v6"/>') : null;
  const attentionButton = attentionCheckEnabled ? addToolBubble('attention-check', 'Start attention check', '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.8"/>') : null;
  console.debug('FocusBridge attention check dock state', { attentionCheckEnabled, rendered: !!attentionButton });
  if (!screenshotToolEnabled) shadow.querySelector('#screenshot').remove();
  const calculatorLaunch = shadow.querySelector('#calculator-launch');
  const display = shadow.querySelector('#display');
  const status = shadow.querySelector('#status');
  const setOpen = (open) => {
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    calculatorLaunch?.setAttribute('aria-expanded', String(open));
  };
  calculatorLaunch?.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  shadow.querySelector('#close').addEventListener('click', () => { setOpen(false); toolPanel.classList.remove('open'); toolPanel.style.display = 'none'; });
  shadow.querySelectorAll('[data-key]').forEach((button) => button.addEventListener('click', () => {
    const key = button.dataset.key;
    let value = display.value === '0' ? '' : display.value;
    if (key === 'C') value = '';
    else if (key === 'back') value = value.slice(0, -1);
    else if (key === '=') {
      try {
        if (!/^[0-9+\-*/().\s]+$/.test(value)) throw new Error('Invalid expression');
        const result = Function('"use strict"; return (' + value + ')')();
        value = Number.isFinite(result) ? String(result) : '';
      } catch { value = ''; status.textContent = 'Check the calculation.'; }
    } else value += key;
    display.value = value || '0';
  }));
  const relativeTime = timestamp => {
    const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
    if (seconds < 60) return 'just now'; if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`; if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`; return `${Math.floor(seconds / 86400)}d ago`;
  };
  const openToolPanel = (html) => { panel.classList.remove('open'); toolPanel.classList.remove('notepad-panel'); toolPanel.innerHTML = html; toolPanel.style.display = 'block'; requestAnimationFrame(() => toolPanel.classList.add('open')); };
  const closeToolPanel = () => { toolPanel.classList.remove('open'); setTimeout(() => { toolPanel.style.display = 'none'; }, 240); };
  const openNotepad = () => {
    openToolPanel('<div class="head"><span>Notepad</span><button id="tool-close" class="tool-button" type="button">×</button></div><div class="tool-row note-actions"><button id="clear-note" class="tool-button" type="button">Clear</button><span id="note-status" class="tool-caption" role="status"></span></div><section class="note-view"><textarea id="note-text" class="tool-textarea" maxlength="5000" placeholder="Write or paste anything here…" aria-label="Persistent notepad text"></textarea><p id="note-count" class="tool-caption">0 words · 0 chars</p></section>');
    toolPanel.classList.add('notepad-panel');
    const text = toolPanel.querySelector('#note-text'), count = toolPanel.querySelector('#note-count'), status = toolPanel.querySelector('#note-status');
    const persistDraft = () => chrome.storage.local.set({ notepadDraftText: text.value, notepadDraftNote: null });
    const updateCount = () => { const chars = text.value.length, words = text.value.trim() ? text.value.trim().split(/\s+/).length : 0; count.textContent = `${words} words · ${chars} chars`; count.style.color = chars >= 4800 ? '#e8c56e' : ''; };
    toolPanel.querySelector('#tool-close').onclick = () => { persistDraft(); closeToolPanel(); };
    toolPanel.querySelector('#clear-note').onclick = () => { text.value = ''; persistDraft(); updateCount(); status.textContent = 'Cleared'; setTimeout(() => { if (status.textContent === 'Cleared') status.textContent = ''; }, 1500); text.focus(); };
    text.oninput = () => { updateCount(); persistDraft(); };
    chrome.storage.local.get(['notepadDraftText'], draft => { text.value = draft.notepadDraftText || ''; updateCount(); });
    updateCount();
  };
  const openConverter = () => {
    openToolPanel('<div class="head"><span>Unit converter</span><button id="tool-close" class="tool-button" type="button">×</button></div><div class="tool-tabs"><button class="tool-button" data-category="length">Length</button><button class="tool-button" data-category="weight">Weight</button><button class="tool-button" data-category="temperature">Temperature</button></div><div class="tool-row"><input id="convert-input" type="number" value="1" aria-label="Value"><select id="from-unit"></select></div><div class="converter-value" id="convert-result">—</div><div class="tool-row"><select id="to-unit"></select><button id="swap-units" class="tool-button" type="button" aria-label="Swap units">↕</button></div><p id="convert-caption" class="tool-caption"></p>');
    const data = { length: { units: { mm: .001, cm: .01, m: 1, km: 1000, in: .0254, ft: .3048, yd: .9144, mi: 1609.344, px: 1 / 96, rem: 16 / 96, em: 16 / 96 }, caption: 'rem and em assume a 16px base.' }, weight: { units: { g: 1, kg: 1000, oz: 28.349523125, lb: 453.59237 } }, temperature: { units: { '°C': 1, '°F': 1, K: 1 } } }; let category = 'length';
    const input = toolPanel.querySelector('#convert-input'), from = toolPanel.querySelector('#from-unit'), to = toolPanel.querySelector('#to-unit'), result = toolPanel.querySelector('#convert-result'), caption = toolPanel.querySelector('#convert-caption');
    const convert = () => { const value = Number(input.value); if (!Number.isFinite(value)) { result.textContent = '—'; return; } let output; if (category === 'temperature') { const c = from.value === '°C' ? value : from.value === '°F' ? (value - 32) * 5 / 9 : value - 273.15; output = to.value === '°C' ? c : to.value === '°F' ? c * 9 / 5 + 32 : c + 273.15; } else output = value * data[category].units[from.value] / data[category].units[to.value]; result.textContent = `${Number(output.toFixed(8))} ${to.value}`; };
    const fill = () => { const units = Object.keys(data[category].units); from.innerHTML = units.map(unit => `<option>${unit}</option>`).join(''); to.innerHTML = units.map(unit => `<option>${unit}</option>`).join(''); to.selectedIndex = Math.min(1, units.length - 1); caption.textContent = data[category].caption || ''; convert(); };
    toolPanel.querySelector('#tool-close').onclick = closeToolPanel; toolPanel.querySelectorAll('[data-category]').forEach(button => button.onclick = () => { category = button.dataset.category; fill(); }); [input, from, to].forEach(element => element.oninput = convert); toolPanel.querySelector('#swap-units').onclick = () => { const value = from.value; from.value = to.value; to.value = value; convert(); }; fill();
  };
  notepadButton?.addEventListener('click', openNotepad);
  converterButton?.addEventListener('click', openConverter);
  let attentionActive = false;
  let attentionSchedule = null;
  let attentionResponseTimer = null;
  let attentionBadge = null;
  let attentionExpectedKey = '';
  let attentionShown = 0;
  let attentionHits = 0;
  let lastAttentionBadgePosition = null;
  const attentionKeys = ['Q', 'X', 'Z', 'W', 'R', 'Y', 'U', 'O', 'P', 'G', 'H', 'N', 'V'];
  const updateAttentionBubbleScore = () => {
    const scoreTheme = attentionShown < 4 ? 'default' : attentionHits / attentionShown >= .7 ? 'green' : 'red';
    attentionButton?.classList.toggle('attention-score-green', scoreTheme === 'green');
    attentionButton?.classList.toggle('attention-score-red', scoreTheme === 'red');
    console.debug('FocusBridge attention check score', { hits: attentionHits, totalShown: attentionShown, theme: scoreTheme });
  };
  const getAttentionBadgePosition = () => {
    const badgeSize = 46;
    const maxViewportX = Math.max(0, window.innerWidth - badgeSize);
    const maxViewportY = Math.max(0, window.innerHeight - badgeSize);
    const minX = Math.min(maxViewportX, Math.ceil(window.innerWidth * .2));
    const maxX = Math.max(minX, Math.min(maxViewportX, Math.floor(window.innerWidth * .8 - badgeSize)));
    const minY = Math.min(maxViewportY, Math.ceil(window.innerHeight * .15));
    const maxY = Math.max(minY, Math.min(maxViewportY, Math.floor(window.innerHeight * .75 - badgeSize)));
    let position;
    for (let attempt = 0; attempt < 4; attempt++) {
      position = { x: minX + Math.floor(Math.random() * (maxX - minX + 1)), y: minY + Math.floor(Math.random() * (maxY - minY + 1)) };
      if (!lastAttentionBadgePosition || position.x !== lastAttentionBadgePosition.x || position.y !== lastAttentionBadgePosition.y) break;
    }
    lastAttentionBadgePosition = position;
    return position;
  };
  const clearAttentionChallenge = () => {
    if (attentionResponseTimer) clearTimeout(attentionResponseTimer);
    attentionResponseTimer = null;
    attentionExpectedKey = '';
    attentionBadge?.remove();
    attentionBadge = null;
  };
  const stopAttentionSession = () => {
    if (!attentionActive) return;
    attentionActive = false;
    if (attentionSchedule) clearTimeout(attentionSchedule);
    attentionSchedule = null;
    clearAttentionChallenge();
    attentionButton?.classList.remove('attention-active');
    attentionButton?.classList.remove('attention-score-green', 'attention-score-red');
    attentionButton?.setAttribute('aria-pressed', 'false');
    attentionButton?.setAttribute('aria-label', 'Start attention check');
  };
  const scheduleAttentionChallenge = () => {
    if (!attentionActive) return;
    const attentionDelayMs = 90000 + Math.floor(Math.random() * 60001);
    console.debug('FocusBridge attention check scheduled', { delaySeconds: attentionDelayMs / 1000 });
    attentionSchedule = setTimeout(() => {
      if (!attentionActive) return;
      attentionExpectedKey = attentionKeys[Math.floor(Math.random() * attentionKeys.length)];
      const badgePosition = getAttentionBadgePosition();
      ensureAttentionCheckAnimation();
      attentionBadge = document.createElement('div');
      attentionBadge.textContent = attentionExpectedKey;
      attentionBadge.setAttribute('role', 'status');
      attentionBadge.setAttribute('aria-label', `Press ${attentionExpectedKey}`);
      attentionBadge.style.cssText = `position:fixed;left:${badgePosition.x}px;top:${badgePosition.y}px;z-index:2147483647;display:grid;place-items:center;box-sizing:border-box;width:46px;height:46px;border:1px solid rgba(255,220,125,.8);border-radius:8px;background:rgba(17,18,21,.96);box-shadow:0 10px 28px rgba(0,0,0,.3);color:#ffe09a;font:700 22px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;pointer-events:none;animation:focusbridgeAttentionIn .18s ease-out;`;
      console.debug('FocusBridge attention check challenge shown', badgePosition);
      (document.fullscreenElement || document.documentElement).appendChild(attentionBadge);
      attentionResponseTimer = setTimeout(() => {
        if (!attentionActive || !attentionExpectedKey) return;
        attentionShown += 1;
        updateAttentionBubbleScore();
        clearAttentionChallenge();
        scheduleAttentionChallenge();
      }, 2500);
    }, attentionDelayMs);
  };
  const onAttentionKeydown = event => {
    if (!attentionActive || !attentionExpectedKey || isTextEntryActive()) return;
    if (event.key.toUpperCase() !== attentionExpectedKey) return;
    attentionHits += 1;
    attentionShown += 1;
    updateAttentionBubbleScore();
    clearAttentionChallenge();
    scheduleAttentionChallenge();
  };
  document.addEventListener('keydown', onAttentionKeydown, true);
  attentionButton?.addEventListener('click', () => {
    if (attentionActive) { console.debug('FocusBridge attention check stopped', { hits: attentionHits, totalShown: attentionShown }); stopAttentionSession(); return; }
    attentionActive = true;
    attentionShown = 0;
    attentionHits = 0;
    attentionButton.classList.remove('attention-score-green', 'attention-score-red');
    attentionButton.classList.add('attention-active');
    attentionButton.setAttribute('aria-pressed', 'true');
    attentionButton.setAttribute('aria-label', 'Stop attention check');
    console.debug('FocusBridge attention check started');
    scheduleAttentionChallenge();
  });
  shadow.querySelector('#history').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'listCaptures' }, ({ captures: focusbridgeCaptureHistory = [] } = {}) => {
      console.debug(`FocusBridge IndexedDB captures (${focusbridgeCaptureHistory.length}):`, focusbridgeCaptureHistory);
      // Override the dock's normal slide-out offset: this compact history
      // panel should sit immediately beside the right-side tool rail.
      // The rail occupies the final ~50px of the viewport. Keep the gallery
      // just to its left rather than letting either surface overlap the other.
      panel.style.cssText = 'right:54px;top:50%;width:224px;min-width:0;max-height:70vh;overflow:hidden;padding:14px;box-sizing:border-box;transform:translate(0,-50%);';
      panel.innerHTML = '<style>#history-list{display:flex;flex-direction:column;align-items:center;gap:12px;max-height:60vh;overflow-y:auto;overflow-x:hidden;padding:2px 6px 2px 0;scrollbar-gutter:stable}#history-list::-webkit-scrollbar{width:6px}#history-list::-webkit-scrollbar-track{background:#111216;border-radius:8px}#history-list::-webkit-scrollbar-thumb{background:rgba(201,169,88,.42);border-radius:8px}#history-list::-webkit-scrollbar-thumb:hover{background:rgba(226,194,109,.66)}.capture-card{position:relative;flex:none;width:168px;max-width:100%;border:1px solid rgba(227,205,142,.12);border-radius:12px;overflow:hidden;background:#08090b;box-shadow:0 7px 18px rgba(0,0,0,.32)}.capture-card img{display:block;width:100%!important;height:114px;object-fit:cover;cursor:pointer}.capture-actions{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:9px;background:linear-gradient(rgba(2,2,3,.2),rgba(2,2,3,.78));opacity:0;transition:opacity .15s}.capture-card:hover .capture-actions{opacity:1}.capture-actions button{display:grid;place-items:center;width:32px;height:32px;padding:0;border:1px solid rgba(227,205,142,.3);border-radius:9px;background:rgba(10,11,14,.86);color:#eee6d3;cursor:pointer}.capture-actions button:hover,.fb-history-close:hover{border-color:rgba(220,185,92,.7);background:rgba(220,185,92,.16);color:#f1d58c}.capture-actions svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8}</style><div class="head"><span style="color:#eee6d3">Recent captures</span><button id="history-close" class="fb-history-close" type="button" aria-label="Close history"></button></div><div id="history-list"></div>';
      const list = panel.querySelector('#history-list');
      if (!focusbridgeCaptureHistory.length) list.textContent = 'No saved captures yet.';
      focusbridgeCaptureHistory.forEach(item => {
        const card = document.createElement('article'); card.className = 'capture-card';
        const image = document.createElement('img'); image.src = item.imageDataUrl; image.draggable = true; image.style.cssText = 'display:block;width:100%;aspect-ratio:1.35;object-fit:cover;cursor:grab;'; card.append(image);
        const actions = document.createElement('div'); actions.className = 'capture-actions';
        const zoom = document.createElement('button'), copy = document.createElement('button'), download = document.createElement('button'); zoom.innerHTML = captureIcon('zoom'); copy.innerHTML = captureIcon('copy'); download.innerHTML = captureIcon('download'); actions.append(zoom, copy, download); card.append(actions);
        const preview = () => { const modal=document.createElement('div'); modal.style.cssText='position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:8vh 8vw;background:rgba(0,0,0,.72);backdrop-filter:blur(7px)'; const box=document.createElement('div');box.style.cssText='position:relative;max-width:80vw;animation:fb-gallery-preview .18s ease both'; const full=document.createElement('img');full.src=item.imageDataUrl;full.style.cssText='display:block;max-width:80vw;max-height:80vh;border-radius:12px'; const tools=document.createElement('div');tools.style.cssText='display:flex;justify-content:center;gap:8px;margin-top:10px'; const modalCopy=document.createElement('button'),modalDownload=document.createElement('button'),remove=document.createElement('button'),close=document.createElement('button'); [modalCopy,modalDownload,remove,close].forEach(button=>button.style.cssText='display:grid;place-items:center;width:38px;height:38px;border:1px solid rgba(255,255,255,.24);border-radius:9px;background:rgba(17,18,21,.85);color:#fff;cursor:pointer');modalCopy.innerHTML=captureIcon('copy');modalDownload.innerHTML=captureIcon('download');remove.innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/></svg>';close.innerHTML=captureIcon('x');tools.append(modalCopy,modalDownload,remove,close);modalCopy.onclick=()=>copyImageDirectly(item.imageDataUrl).catch(()=>{});modalDownload.onclick=()=>{const link=document.createElement('a');link.href=item.imageDataUrl;link.download='focusbridge-capture.jpg';link.click();};remove.onclick=()=>chrome.runtime.sendMessage({action:'deleteCapture',id:item.id},()=>{card.remove();modal.remove();});close.onclick=()=>modal.remove();box.append(full,tools);modal.append(box);modal.onclick=e=>{if(e.target===modal)modal.remove();};shadow.append(modal); }; zoom.onclick=event=>{event.stopPropagation();preview();}; copy.onclick=event=>{event.stopPropagation();copyImageDirectly(item.imageDataUrl).catch(()=>{});}; download.onclick=event=>{event.stopPropagation();const link=document.createElement('a');link.href=item.imageDataUrl;link.download='focusbridge-capture.jpg';link.click();};
        list.append(card);
      });
      const closeHistory = () => { panel.style.cssText = ''; setOpen(false); document.removeEventListener('pointerdown', outsideHistory, true); };
      const outsideHistory = event => { if (event.target !== host) closeHistory(); };
      const historyClose = panel.querySelector('#history-close'); historyClose.innerHTML = captureIcon('x'); historyClose.style.cssText = 'display:grid;place-items:center;width:28px;height:28px;padding:0;border:1px solid rgba(227,205,142,.22);border-radius:8px;background:transparent;color:#eee6d3;cursor:pointer;'; historyClose.querySelector('svg').setAttribute('width', '16'); historyClose.querySelector('svg').setAttribute('height', '16'); historyClose.addEventListener('click', closeHistory);
      setOpen(true);
      // Delay prevents the click that opened the gallery from closing it.
      setTimeout(() => document.addEventListener('pointerdown', outsideHistory, true), 0);
    });
  });
  // IndexedDB writes happen in the extension service worker. Refresh an open
  // gallery only after that write is confirmed, rather than rendering a stale
  // in-memory list.
  chrome.runtime.onMessage.addListener(message => {
    if (message.action === 'captureSaved' && panel.classList.contains('open') && panel.querySelector('#history-list')) {
      shadow.querySelector('#history').click();
    }
  });
  const captureLayer = document.createElement('div');
  captureLayer.style.cssText = 'display:none;position:fixed;inset:0;z-index:2147483647;color:#fff;';
  // Lucide icon SVG source (https://lucide.dev/icons/, MIT License).
  const captureIconPaths = {
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
    back: '<path d="m12 19-7-7 7-7M5 12h14"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>'
  };
  const captureIcon = name => `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${captureIconPaths[name]}</svg>`;
  captureLayer.innerHTML = '<div id="shade" style="position:fixed;inset:0;background:rgba(0,0,0,.62);cursor:crosshair"></div><div id="selection" style="display:none;position:fixed;border:1px dashed #e8c56e;box-shadow:0 0 0 9999px rgba(0,0,0,.42),0 0 0 1px rgba(8,9,11,.92);cursor:move"><div id="selectionSize" aria-live="polite"></div><div id="handle" style="position:absolute;right:-8px;bottom:-8px;width:16px;height:16px;background:#e8c56e;border:2px solid #17140c;border-radius:50%;cursor:nwse-resize"></div></div><div id="pickerBar" style="display:none;position:fixed;left:50%;bottom:28px;transform:translateX(-50%);gap:8px;padding:8px;border:1px solid rgba(255,255,255,.22);border-radius:12px;background:rgba(17,18,21,.94);box-shadow:0 12px 34px rgba(0,0,0,.35)"><button id="pickerCancel" title="Cancel" aria-label="Cancel" type="button">&#215;</button><button id="cropEdit" title="Annotate selected area" aria-label="Annotate selected area" type="button">&#9998;</button></div><div id="editor" style="display:none;position:fixed;inset:0;background:rgba(10,11,13,.97);padding:22px;text-align:center"><div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-bottom:12px"><button id="backToCrop" title="Back to selection" aria-label="Back to selection" type="button">&#8592;</button><button id="pen" title="Pen" aria-label="Pen" type="button">&#9998;</button><input id="penColor" type="color" value="#e8c56e" aria-label="Pen color"><button id="copyCrop" title="Copy to clipboard" aria-label="Copy to clipboard" type="button">&#10697;</button><button id="downloadCrop" title="Download PNG" aria-label="Download PNG" type="button">&#8681;</button><button id="closeEditor" title="Done" aria-label="Done" type="button">&#215;</button></div><canvas id="captureCanvas" style="max-width:92vw;max-height:82vh;cursor:crosshair;box-shadow:0 12px 45px rgba(0,0,0,.5)"></canvas><div id="captureStatus" style="margin-top:9px;font-size:12px;color:#d5cfbf"></div></div>';
  const captureStyle = document.createElement('style');
  captureStyle.textContent = '#selectionSize{position:absolute;left:-1px;top:-29px;padding:4px 7px;border:1px solid rgba(232,197,110,.72);border-radius:6px;background:rgba(12,13,15,.94);box-shadow:0 5px 14px rgba(0,0,0,.34);color:#f1d58c;font-size:12px;font-weight:700;line-height:1;letter-spacing:.02em;white-space:nowrap;pointer-events:none}#pickerBar,#editor>div:first-child{border:1px solid rgba(255,255,255,.22)!important;border-radius:14px;background:rgba(17,18,21,.88)!important;backdrop-filter:blur(16px);box-shadow:0 12px 34px rgba(0,0,0,.35)}#pickerBar button,#editor button{appearance:none;display:grid;place-items:center;width:38px;height:38px;border:1px solid rgba(255,255,255,.2);border-radius:10px;background:rgba(255,255,255,.09);color:#fff;padding:0;cursor:pointer}#pickerBar button svg,#editor button svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}#penColor{width:38px;height:38px;padding:4px;border:1px solid rgba(255,255,255,.2);border-radius:10px;background:rgba(255,255,255,.09);cursor:pointer}#pickerBar button:hover,#editor button:hover{background:rgba(255,255,255,.16)}';
  shadow.append(captureStyle, captureLayer);
  const selection = captureLayer.querySelector('#selection');
  const selectionSize = captureLayer.querySelector('#selectionSize');
  const editor = captureLayer.querySelector('#editor');
  const pickerBar = captureLayer.querySelector('#pickerBar');
  const canvas = captureLayer.querySelector('#captureCanvas');
  const captureStatus = captureLayer.querySelector('#captureStatus');
  const quickDownload = document.createElement('button');
  quickDownload.id = 'quick-download'; quickDownload.type = 'button'; quickDownload.innerHTML = '&#8681;'; quickDownload.title = 'Download selected area'; quickDownload.setAttribute('aria-label', 'Download selected area');
  const quickCopy = document.createElement('button');
  quickCopy.id = 'quick-copy'; quickCopy.type = 'button'; quickCopy.innerHTML = '&#10697;'; quickCopy.title = 'Copy selected area'; quickCopy.setAttribute('aria-label', 'Copy selected area');
  pickerBar.append(quickDownload, quickCopy);
  [['#pickerCancel', 'x'], ['#cropEdit', 'pen'], ['#quickDownload', 'download'], ['#quickCopy', 'copy'], ['#backToCrop', 'back'], ['#pen', 'pen'], ['#copyCrop', 'copy'], ['#downloadCrop', 'download'], ['#closeEditor', 'x']].forEach(([selector, icon]) => {
    const button = captureLayer.querySelector(selector) || (selector === '#quickDownload' ? quickDownload : selector === '#quickCopy' ? quickCopy : null);
    if (button) button.innerHTML = captureIcon(icon);
  });
  const copyImageDirectly = async (dataUrl) => {
    const match = /^data:([^;,]+);base64,(.+)$/.exec(dataUrl);
    if (!match) throw new Error('Invalid image data.');
    const binary = atob(match[2]), bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
    const blob = new Blob([bytes], { type: match[1] });
    try {
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    } catch (directError) {
      await new Promise((resolve, reject) => chrome.runtime.sendMessage({ action: 'copyImageToClipboard', dataUrl }, response => {
        if (chrome.runtime.lastError || !response?.success) reject(new Error(response?.error || chrome.runtime.lastError?.message || directError.message));
        else resolve();
      }));
    }
  };
  const completeCapture = async (dataUrl, format, action) => { await action(); };
  let sourceImage, rect = {}, pointerMode = null, pointerStart, drawing = false, penEnabled = false, isCreatingSelection = false;
  const setSelection = () => {
    Object.assign(selection.style, { left: rect.x + 'px', top: rect.y + 'px', width: rect.width + 'px', height: rect.height + 'px' });
    const scaleX = sourceImage?.naturalWidth / window.innerWidth || 1;
    const scaleY = sourceImage?.naturalHeight / window.innerHeight || 1;
    selectionSize.textContent = `${Math.round(rect.width * scaleX)} × ${Math.round(rect.height * scaleY)}`;
  };
  const resetSelection = () => {
    rect = {};
    pointerStart = null;
    isCreatingSelection = false;
    selection.style.display = 'none';
    selection.style.left = '';
    selection.style.top = '';
    selection.style.width = '';
    selection.style.height = '';
  };
  const closeCapture = () => { captureLayer.style.display = 'none'; editor.style.display = 'none'; pickerBar.style.display = 'none'; resetSelection(); captureStatus.textContent = ''; captureLayer.remove(); };
  const pointerMove = (event) => {
    if (!pointerMode) return;
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (pointerMode === 'move') { rect.x = Math.max(0, Math.min(window.innerWidth - rect.width, pointerStart.rectX + dx)); rect.y = Math.max(0, Math.min(window.innerHeight - rect.height, pointerStart.rectY + dy)); }
    else { rect.width = Math.max(80, Math.min(window.innerWidth - rect.x, pointerStart.rectW + dx)); rect.height = Math.max(80, Math.min(window.innerHeight - rect.y, pointerStart.rectH + dy)); }
    setSelection();
  };
  selection.addEventListener('pointerdown', (event) => {
    pointerMode = event.target.id === 'handle' ? 'resize' : 'move';
    pointerStart = { x:event.clientX, y:event.clientY, rectX:rect.x, rectY:rect.y, rectW:rect.width, rectH:rect.height };
    selection.setPointerCapture(event.pointerId);
  });
  selection.addEventListener('pointermove', pointerMove);
  selection.addEventListener('pointerup', () => { pointerMode = null; });
  captureLayer.querySelector('#pickerCancel').addEventListener('click', closeCapture);
  const shade = captureLayer.querySelector('#shade');
  shade.addEventListener('pointerdown', (event) => {
    isCreatingSelection = true;
    rect = { x:event.clientX, y:event.clientY, width:0, height:0 };
    selection.style.display = 'block';
    setSelection();
    pickerBar.style.display = 'none';
    shade.setPointerCapture(event.pointerId);
  });
  shade.addEventListener('pointermove', (event) => {
    if (!isCreatingSelection) return;
    rect.x = Math.min(pointerStart?.x ?? event.clientX, event.clientX);
    rect.y = Math.min(pointerStart?.y ?? event.clientY, event.clientY);
    const startX = pointerStart?.x ?? event.clientX, startY = pointerStart?.y ?? event.clientY;
    rect.width = Math.abs(event.clientX - startX);
    rect.height = Math.abs(event.clientY - startY);
    setSelection();
  });
  shade.addEventListener('pointerup', () => {
    isCreatingSelection = false;
    if (rect.width > 18 && rect.height > 18) pickerBar.style.display = 'flex';
  });
  const selectedImageData = () => {
    const selected = document.createElement('canvas');
    const scaleX = sourceImage.naturalWidth / window.innerWidth, scaleY = sourceImage.naturalHeight / window.innerHeight;
    selected.width = Math.round(rect.width * scaleX); selected.height = Math.round(rect.height * scaleY);
    selected.getContext('2d').drawImage(sourceImage, rect.x * scaleX, rect.y * scaleY, selected.width, selected.height, 0, 0, selected.width, selected.height);
    return selected.toDataURL('image/png');
  };
  quickCopy.addEventListener('click', () => {
    const dataUrl = selectedImageData();
    copyImageDirectly(dataUrl).then(closeCapture).catch(error => { captureStatus.textContent = `Copy failed: ${error.name || 'Error'} — ${error.message || 'Browser blocked clipboard access.'}`; });
  });
  quickDownload.addEventListener('click', () => {
    const dataUrl = selectedImageData(); const link = document.createElement('a'); link.href = dataUrl; link.download = 'focusbridge-capture.png'; link.click(); closeCapture();
  });
  shade.addEventListener('pointerdown', (event) => { pointerStart = { x:event.clientX, y:event.clientY }; }, true);
  captureLayer.querySelector('#cropEdit').addEventListener('click', () => {
    const scaleX = sourceImage.naturalWidth / window.innerWidth, scaleY = sourceImage.naturalHeight / window.innerHeight;
    canvas.width = Math.round(rect.width * scaleX); canvas.height = Math.round(rect.height * scaleY);
    canvas.getContext('2d').drawImage(sourceImage, rect.x * scaleX, rect.y * scaleY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    pickerBar.style.display = 'none'; selection.style.display = 'none'; editor.style.display = 'block'; captureStatus.textContent = 'Use Pen to mark the image, then copy or download.';
  });
  captureLayer.querySelector('#backToCrop').addEventListener('click', () => { editor.style.display = 'none'; pickerBar.style.display = 'flex'; selection.style.display = 'block'; });
  captureLayer.querySelector('#closeEditor').addEventListener('click', closeCapture);
  captureLayer.querySelector('#pen').addEventListener('click', (event) => { penEnabled = !penEnabled; event.currentTarget.style.background = penEnabled ? '#d7b45a' : ''; event.currentTarget.style.color = penEnabled ? '#17140c' : ''; });
  const canvasPoint = (event) => { const bounds = canvas.getBoundingClientRect(); return { x:(event.clientX - bounds.left) * canvas.width / bounds.width, y:(event.clientY - bounds.top) * canvas.height / bounds.height }; };
  canvas.addEventListener('pointerdown', (event) => { if (!penEnabled) return; drawing = true; const point = canvasPoint(event), context = canvas.getContext('2d'); context.beginPath(); context.moveTo(point.x, point.y); canvas.setPointerCapture(event.pointerId); });
  canvas.addEventListener('pointermove', (event) => { if (!drawing) return; const point = canvasPoint(event), context = canvas.getContext('2d'); context.lineWidth = Math.max(3, canvas.width / 350); context.lineCap = 'round'; context.strokeStyle = captureLayer.querySelector('#penColor').value; context.lineTo(point.x, point.y); context.stroke(); });
  canvas.addEventListener('pointerup', () => { drawing = false; });
  captureLayer.querySelector('#copyCrop').addEventListener('click', () => {
    captureStatus.textContent = 'Copying…';
    const dataUrl = canvas.toDataURL('image/png');
    completeCapture(dataUrl, 'png', () => copyImageDirectly(dataUrl)).then(closeCapture).catch(error => { captureStatus.textContent = `Copy failed: ${error.name || 'Error'} — ${error.message || 'Browser blocked clipboard access.'}`; });
  });
  captureLayer.querySelector('#downloadCrop').addEventListener('click', () => { const dataUrl = canvas.toDataURL('image/png'); completeCapture(dataUrl, 'png', () => { const link = document.createElement('a'); link.href = dataUrl; link.download = 'focusbridge-capture.png'; link.click(); }).then(closeCapture).catch(error => { captureStatus.textContent = `Save failed: ${error.message}`; }); });
  const openScreenshotCapture = () => {
    if (!captureLayer.isConnected) shadow.append(captureLayer);
    status.textContent = 'Preparing area capture…';
    host.style.visibility = 'hidden';
    requestAnimationFrame(() => setTimeout(() => {
      chrome.runtime.sendMessage({ action: 'captureVisibleScreenshot' }, (response) => {
        host.style.visibility = '';
        if (chrome.runtime.lastError || !response?.success || !response.dataUrl) {
          status.textContent = response?.error || 'Could not capture the page.';
          return;
        }
        sourceImage = new Image();
        sourceImage.onload = () => {
          resetSelection(); pickerBar.style.display = 'none'; captureLayer.style.display = 'block'; status.textContent = '';
        };
        sourceImage.src = response.dataUrl;
      });
    }, 80));
  };
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (captureLayer.style.display !== 'none') closeCapture();
    if (toolPanel.style.display !== 'none') closeToolPanel();
    if (panel.classList.contains('open')) setOpen(false);
  }, true);
  document.addEventListener('pointerdown', event => {
    if (toolPanel.style.display !== 'none' && event.target !== host) closeToolPanel();
  }, true);
  shadow.addEventListener('pointerdown', event => {
    if (toolPanel.style.display !== 'none' && !event.composedPath().includes(toolPanel)) closeToolPanel();
  }, true);
  shadow.querySelector('#screenshot')?.addEventListener('click', openScreenshotCapture);

  const isTextEntryActive = () => {
    const activeElement = document.activeElement;
    return activeElement?.tagName === 'INPUT'
      || activeElement?.tagName === 'TEXTAREA'
      || activeElement?.isContentEditable === true;
  };
  const registerHoldToOpenShortcut = (key, openFn, enabled) => {
    let timer = null, triggered = false;
    document.addEventListener('keydown', event => {
      if (event.key.toLowerCase() !== key) return;
      if (!enabled() || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || isTextEntryActive() || timer || triggered) return;
      timer = setTimeout(() => { timer = null; if (enabled()) { triggered = true; openFn(); } }, 2000);
    }, true);
    document.addEventListener('keyup', event => { if (event.key.toLowerCase() === key) { if (timer) clearTimeout(timer); timer = null; triggered = false; } }, true);
  };
  registerHoldToOpenShortcut('s', openScreenshotCapture, () => screenshotToolEnabled && screenshotHoldEnabled);
  registerHoldToOpenShortcut('n', openNotepad, () => notepadToolEnabled && notepadHoldEnabled);
  registerHoldToOpenShortcut('u', openConverter, () => unitConverterToolEnabled && unitConverterHoldEnabled);
  const dockHomeParent = document.documentElement || document.body;
  const moveDockForFullscreen = () => {
    const fullscreenTarget = document.fullscreenElement;
    const destination = fullscreenTarget || dockHomeParent;
    if (destination && host.parentNode !== destination) destination.appendChild(host);
    if (attentionBadge && destination && attentionBadge.parentNode !== destination) destination.appendChild(attentionBadge);
  };
  dockHomeParent.appendChild(host);
  document.addEventListener('fullscreenchange', moveDockForFullscreen);
  moveDockForFullscreen();
  cleanupToolsDock = () => {
    stopAttentionSession();
    document.removeEventListener('keydown', onAttentionKeydown, true);
    document.removeEventListener('fullscreenchange', moveDockForFullscreen);
    cleanupToolsDock = null;
  };
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
function setBubbleCardSurface(bubble, visible) {
  if (!bubble) return;
  const isDark = currentTheme === 'dark';
  bubble.style.background = visible
    ? (isDark ? "rgba(12, 21, 33, 0.94)" : "rgba(255, 255, 255, 0.94)")
    : "transparent";
  bubble.style.borderColor = visible
    ? (isDark ? "rgba(214, 227, 245, 0.30)" : "rgba(35, 52, 73, 0.22)")
    : "transparent";
  bubble.style.boxShadow = visible
    ? (isDark
      ? "0 14px 34px rgba(2, 8, 18, 0.42), inset 0 1px 0 rgba(255,255,255,0.12)"
      : "0 14px 30px rgba(35, 51, 70, 0.20), inset 0 1px 0 rgba(255,255,255,0.86)")
    : "none";
}

const updateBubbleTheme = (theme) => {
  if (!isValid()) return;
  currentTheme = theme;
  const bubble = document.getElementById("focus-bubble-root");
  if (!bubble) return;

  const isDark = theme === 'dark';
  setBubbleCardSurface(bubble, bubble.dataset.expanded === "true" || isDistractionMode);

  const goalText = document.getElementById("bubbleGoalText");
  if (goalText) goalText.style.color = isDark ? "#fff" : "#000";

  const timerDetail = document.getElementById("bubbleTimerDetail");
  if (timerDetail) timerDetail.style.color = isDark ? "#ffc35a" : "#a45c00";

  const mins = document.getElementById("pomoMins");
  if (mins) mins.style.color = isDark ? "#f4f7fb" : "#172033";

  const pomo = document.getElementById("pomoContainer");
  if (pomo) {
    pomo.style.background = isDark ? "rgba(18, 32, 48, 0.94)" : "rgba(248, 250, 253, 0.96)";
    pomo.style.borderColor = isDark ? "rgba(214, 227, 245, 0.24)" : "rgba(35, 52, 73, 0.18)";
    pomo.style.boxShadow = isDark
      ? "0 8px 20px rgba(1, 7, 16, 0.34), inset 0 1px 0 rgba(255,255,255,0.10)"
      : "0 8px 18px rgba(35, 51, 70, 0.16), inset 0 1px 0 rgba(255,255,255,0.86)";
  }

  const circleBg = document.getElementById('bubbleRingTrack');
  if (circleBg) circleBg.setAttribute("stroke", isDark ? "rgba(255,255,255,0.13)" : "rgba(31,41,55,0.10)");

  const circleFlow = document.getElementById('bubbleRingFlow');
  if (circleFlow) circleFlow.setAttribute("stroke", isDark ? "rgba(255, 216, 145, 0.62)" : "rgba(226, 136, 0, 0.52)");

  const quizBtn = document.getElementById("focus-quiz-btn");
  if (quizBtn) {
    quizBtn.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.52)';
    quizBtn.style.color = isDark ? '#d6e2f2' : '#41536b';
    quizBtn.style.borderColor = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(47,65,85,0.14)';
  }
};

// 3. RENDER THE TOP ORANGE FLASH
function renderOrangeFlash(goal) {
  if (!isValid() || document.getElementById("focus-bridge-glow-top")) return;
  const glow = document.createElement("div");
  glow.id = "focus-bridge-glow-top";
  glow.setAttribute("aria-hidden", "true");
  glow.style.cssText = `position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:96px!important;pointer-events:none!important;z-index:2147483646!important;background:linear-gradient(to bottom, rgba(255,177,54,0.50) 0%, rgba(255,143,0,0.27) 58%, rgba(255,143,0,0) 100%)!important;box-shadow:inset 0 3px 0 rgba(255,232,180,0.92)!important;will-change:opacity,transform;animation:nudgeAttentionGlow 4.2s infinite cubic-bezier(.45,0,.25,1)!important;`;

  if (!document.getElementById("focus-bridge-anim")) {
    const style = document.createElement("style");
    style.id = "focus-bridge-anim";
    style.textContent = `@keyframes nudgeAttentionGlow { 0%,100% { opacity:.48; transform:translateY(-10px) scaleY(.94); } 46% { opacity:1; transform:translateY(0) scaleY(1); } 62% { opacity:.82; transform:translateY(-2px) scaleY(.985); } } @keyframes nudgeBuddyFlyIn { from { transform:translateX(-115vw) rotate(-12deg); } 72% { transform:translateX(8px) rotate(3deg); } to { transform:translateX(0) rotate(0); } } @keyframes nudgeBuddyFloat { 0%,100% { translate:0 0; } 50% { translate:0 -4px; } }`;
    document.documentElement.appendChild(style);
  }
  document.documentElement.appendChild(glow);
  if (nudgeBuddyEnabled) renderNudgeBuddy();
}

function renderNudgeBuddy() {
  if (document.getElementById("focus-bridge-nudge-buddy")) return;
  const name = focusUserName || "friend";
  const messages = ["{name}, one useful minute is enough to restart.","{name}, come back to the task in front of you.","{name}, your future self will thank you for this focus.","{name}, you are closer than this distraction suggests.","{name}, finish the next small step.","{name}, make this minute intentional.","{name}, consistency matters more than the mood.","{name}, this tab can wait. Get back to your goal.","{name}, you started for a reason—honor it.","{name}, eyes back on the task.","{name}, a short reset is still progress.","{name}, keep the promise you made yourself.","{name}, make the next minute count.","{name}, focus is a skill you are training.","{name}, stay here—the momentum is building.","{name}, do the tiny next step now.","{name}, you do not need motivation to continue.","{name}, protect this block of time.","{name}, let the timer carry you forward.","{name}, you can handle one more minute.","{name}, less switching, more finishing.","{name}, this is how deep work begins.","{name}, put attention where it matters.","{name}, returning is the hard part—well done.","{name}, your goal deserves this moment.","{name}, choose progress over distraction.","{name}, finish the current thought first.","{name}, you are building trust with yourself.","{name}, calm focus—then the next step.","{name}, give this task your full minute.","{name}, the finish line is getting closer.","{name}, keep going. You have this.","{name}, is this tab helping your goal right now?","{name}, can this wait until the timer ends?","{name}, what is the next action that moves work forward?","{name}, would tomorrow-you choose this distraction?","{name}, is this the work you intended to do?","{name}, can you give your goal just one more focused minute?"];
  const buddy = document.createElement("div");
  buddy.id = "focus-bridge-nudge-buddy";
  buddy.setAttribute("aria-hidden", "true");
  buddy.style.cssText = "position:fixed;right:18px;bottom:106px;z-index:2147483647;width:58px;height:58px;pointer-events:none;animation:nudgeBuddyFlyIn .9s cubic-bezier(.2,.9,.25,1) both;";
  const message = document.createElement("div");
  message.style.cssText = "position:absolute;right:20px;bottom:44px;width:max-content;max-width:210px;padding:9px 11px;border:1px solid rgba(255,211,128,.42);border-radius:14px 14px 4px 14px;background:rgba(14,24,38,.97);box-shadow:0 10px 26px rgba(1,8,18,.38);color:#fff5dc;font:600 12px/1.35 'Segoe UI',sans-serif;";
  message.innerText = name + ", checking your timer…";
  chrome.storage.local.get(['pomoActive', 'pomoEndTime', 'workDuration'], (timer) => {
    const total = (timer.workDuration || 25) * 60000;
    const remaining = Math.max(0, (timer.pomoEndTime || Date.now() + total) - Date.now());
    const progress = timer.pomoActive ? 1 - (remaining / total) : 0;
    const isFinishLanguage = /finish|closer|final|almost|nearly/i;
    const phase = progress < 0.25 ? 'early' : progress < 0.75 ? 'middle' : 'late';
    const phaseMessages = phase === 'early'
      ? messages.filter(item => !isFinishLanguage.test(item))
      : phase === 'late'
        ? messages.filter(item => isFinishLanguage.test(item) || /one more|keep going|timer ends/i.test(item))
        : messages.filter(item => !/finish line|almost there|nearly yours/i.test(item));
    if (!nudgeBuddyMessagePool[phase]?.length) nudgeBuddyMessagePool[phase] = [...phaseMessages].sort(() => Math.random() - 0.5);
    message.innerText = nudgeBuddyMessagePool[phase].pop().replace('{name}', name);
  });
  const tail = document.createElement("div");
  tail.style.cssText = "position:absolute;right:25px;bottom:37px;width:13px;height:13px;background:rgba(14,24,38,.97);border-right:1px solid rgba(255,211,128,.42);border-bottom:1px solid rgba(255,211,128,.42);transform:rotate(45deg);";
  const owl = document.createElement("div");
  owl.style.cssText = "position:relative;z-index:1;width:58px;height:58px;display:grid;place-items:center;animation:nudgeBuddyFloat 2.5s ease-in-out 1s infinite;";
  owl.innerHTML = '<svg viewBox="0 0 64 64" width="58" height="58"><path d="M15 25 10 13l13 6 9-7 9 7 13-6-5 12c4 5 5 10 4 17-2 11-11 17-25 17S7 53 8 42c-1-7 0-12 7-17Z" fill="#344764" stroke="#a8bbd4" stroke-width="2"/><path d="M17 40c2 12 28 16 31 0-5 4-26 4-31 0Z" fill="#263852"/><circle cx="22" cy="34" r="9" fill="#f4b83f"/><circle cx="42" cy="34" r="9" fill="#f4b83f"/><circle cx="22" cy="34" r="4" fill="#132238"/><circle cx="42" cy="34" r="4" fill="#132238"/><path d="m32 37-4 6h8l-4-6Z" fill="#f2a629"/><path d="M21 52c4 3 18 3 22 0" fill="none" stroke="#a8bbd4" stroke-width="2" stroke-linecap="round"/></svg>';
  buddy.append(message, tail, owl);
  document.documentElement.appendChild(buddy);
}

// 4. RENDER THE FLUID BUBBLE
// 4. RENDER THE FLUID BUBBLE
function renderNudgeWidget(goal) {
  if (document.getElementById("focus-bubble-root")) return;

  const isDark = currentTheme === 'dark';
  const bubble = document.createElement("div");
  bubble.id = "focus-bubble-root";
  bubble.dataset.variant = "nudge";
  bubble.dataset.expanded = "true";
  if (!document.getElementById('focus-bubble-ring-animation')) {
    const animationStyle = document.createElement('style');
    animationStyle.id = 'focus-bubble-ring-animation';
    animationStyle.textContent = '@keyframes focusBubbleRingFlow { to { stroke-dashoffset: -28; } }';
    document.documentElement.appendChild(animationStyle);
  }
  Object.assign(bubble.style, {
    position: "fixed", right: "20px", bottom: "24px",
    width: "280px", height: "76px", zIndex: "2147483647",
    boxSizing: "border-box", display: "grid",
    gridTemplateColumns: "68px minmax(0, 1fr) 38px", columnGap: "10px",
    alignItems: "center", padding: "4px 12px 4px 6px",
    borderRadius: "20px", userSelect: "none",
    border: `1px solid ${isDark ? "rgba(214, 227, 245, 0.30)" : "rgba(35, 52, 73, 0.22)"}`,
    background: isDark ? "rgba(12, 21, 33, 0.96)" : "rgba(255, 255, 255, 0.96)",
    boxShadow: isDark
      ? "0 14px 34px rgba(2, 8, 18, 0.42), inset 0 1px 0 rgba(255,255,255,0.12)"
      : "0 14px 30px rgba(35, 51, 70, 0.20), inset 0 1px 0 rgba(255,255,255,0.86)",
    backdropFilter: "blur(16px) saturate(135%)",
    WebkitBackdropFilter: "blur(16px) saturate(135%)"
  });

  const copy = document.createElement("div");
  copy.style.cssText = "min-width:0;display:flex;flex-direction:column;justify-content:center;";

  const pomoContainer = document.createElement("div");
  pomoContainer.id = "pomoContainer";
  pomoContainer.style.cssText = `position:relative;width:68px;height:68px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:1px solid ${isDark ? "rgba(214, 227, 245, 0.24)" : "rgba(35, 52, 73, 0.18)"};background:${isDark ? "rgba(18, 32, 48, 0.94)" : "rgba(248, 250, 253, 0.96)"};box-shadow:${isDark ? "0 8px 20px rgba(1, 7, 16, 0.34), inset 0 1px 0 rgba(255,255,255,0.10)" : "0 8px 18px rgba(35, 51, 70, 0.16), inset 0 1px 0 rgba(255,255,255,0.86)"};`;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "68");
  svg.setAttribute("height", "68");
  svg.style.cssText = "position:absolute;pointer-events:none;";
  const track = document.createElementNS("http://www.w3.org/2000/svg", "path");
  track.id = "bubbleRingTrack";
  track.setAttribute("d", "M34 5 A29 29 0 0 0 34 63");
  track.setAttribute("stroke", isDark ? "rgba(255,255,255,0.13)" : "rgba(31,41,55,0.10)");
  track.setAttribute("stroke-width", "3");
  track.setAttribute("fill", "none");
  const ring = document.createElementNS("http://www.w3.org/2000/svg", "path");
  ring.id = "bubbleRing";
  ring.setAttribute("d", "M34 5 A29 29 0 0 0 34 63");
  ring.setAttribute("stroke", "#ffb12d");
  ring.setAttribute("stroke-width", "3.5");
  ring.setAttribute("fill", "none");
  ring.setAttribute("stroke-dasharray", "91");
  ring.setAttribute("stroke-dashoffset", "91");
  ring.setAttribute("stroke-linecap", "round");
  ring.style.cssText = "transition:stroke-dashoffset 0.65s cubic-bezier(0.25, 1, 0.5, 1);filter:drop-shadow(0 0 3px rgba(255,177,45,0.45));";
  const flow = document.createElementNS("http://www.w3.org/2000/svg", "path");
  flow.id = "bubbleRingFlow";
  flow.setAttribute("d", "M34 5 A29 29 0 0 0 34 63");
  flow.setAttribute("stroke", isDark ? "rgba(255, 216, 145, 0.62)" : "rgba(226, 136, 0, 0.52)");
  flow.setAttribute("stroke-width", "1.35");
  flow.setAttribute("stroke-dasharray", "1.4 5.2");
  flow.setAttribute("fill", "none");
  flow.setAttribute("stroke-linecap", "round");
  flow.style.animation = "focusBubbleRingFlow 1.35s linear infinite";
  svg.append(track, ring, flow);
  const mins = document.createElement("span");
  mins.id = "pomoMins";
  mins.innerText = "--";
  mins.style.cssText = `font-size:14px;font-weight:750;font-family:'Segoe UI',sans-serif;letter-spacing:-0.02em;color:${isDark ? '#f4f7fb' : '#172033'};`;
  pomoContainer.append(svg, mins);

  const timerDetail = document.createElement("div");
  timerDetail.id = "bubbleTimerDetail";
  timerDetail.innerText = "--:-- LEFT";
  timerDetail.style.cssText = `font-size:11px;font-weight:750;color:${isDark ? '#ffc35a' : '#a45c00'};letter-spacing:0.06em;margin-bottom:3px;`;

  const intent = document.createElement("div");
  intent.innerText = "FOCUS INTENT";
  intent.style.cssText = `font-size:8px;font-weight:750;color:${isDark ? 'rgba(221,232,246,0.58)' : 'rgba(31,41,55,0.52)'};letter-spacing:0.11em;margin-bottom:3px;`;

  const goalText = document.createElement("div");
  goalText.id = "bubbleGoalText";
  goalText.innerText = goal.length > 15 ? goal.substring(0, 15) + "..." : goal;
  goalText.title = goal;
  goalText.style.cssText = `overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:${isDark ? '#f4f7fb' : '#172033'};font-size:14px;font-weight:700;line-height:1.2;`;
  copy.append(timerDetail, intent, goalText);

  const quizBtn = document.createElement("button");
  quizBtn.id = "focus-quiz-btn";
  quizBtn.type = "button";
  quizBtn.title = "Take a Quiz";
  quizBtn.setAttribute("aria-label", "Take a Quiz");
  quizBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>';
  quizBtn.style.cssText = `width:38px;height:38px;padding:0;display:grid;place-items:center;cursor:pointer;border-radius:50%;border:1px solid ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(47,65,85,0.16)'};background:${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.52)'};color:${isDark ? '#d6e2f2' : '#41536b'};`;
  quizBtn.onclick = (event) => {
    event.stopPropagation();
    renderRecallSetupModal();
  };

  bubble.append(pomoContainer, copy, quizBtn);
  document.documentElement.appendChild(bubble);
}

function renderFocusBubble(goal, isDistracted = false) {
  if (document.getElementById("focus-bubble-root")) return;
  activeGoalText = goal;

  const bubble = document.createElement("div");
  bubble.id = "focus-bubble-root";
  const isDark = currentTheme === 'dark';

  // Decide initial shape based on distraction state
  const initialWidth = "68px";
  const initialRadius = "50%";

  Object.assign(bubble.style, {
    position: "fixed", bottom: "30px", right: "-34px", left: "auto",
    width: initialWidth, height: "68px",
    minWidth: "68px",
    maxWidth: "400px", // Constrain max width
    zIndex: "2147483647", cursor: "grab", borderRadius: initialRadius,
    display: "flex", alignItems: "center", justifyContent: "flex-start",
    boxShadow: "none", userSelect: "none", overflow: "hidden",
    border: "1px solid transparent", background: "transparent",
    backdropFilter: "blur(16px) saturate(135%)", WebkitBackdropFilter: "blur(16px) saturate(135%)",
    transition: "width 0.28s cubic-bezier(0.25, 1, 0.5, 1), left 0.28s cubic-bezier(0.25, 1, 0.5, 1), right 0.28s cubic-bezier(0.25, 1, 0.5, 1), border-radius 0.28s, background 0.3s, box-shadow 0.3s"
  });
  bubble.dataset.snappedSide = "right";
  bubble.dataset.expanded = isDistracted ? "true" : "false";

  if (!document.getElementById('focus-bubble-ring-animation')) {
    const animationStyle = document.createElement('style');
    animationStyle.id = 'focus-bubble-ring-animation';
    animationStyle.textContent = '@keyframes focusBubbleRingFlow { to { stroke-dashoffset: -28; } }';
    document.documentElement.appendChild(animationStyle);
  }

  // Create Pomo Container (State 1)
  constomoContainer = document.createElement('div');
  const pomoContainer = document.createElement('div');
  pomoContainer.id = "pomoContainer";
  Object.assign(pomoContainer.style, {
    position: "relative", width: "68px", height: "68px", flexShrink: "0",
    display: 'flex', alignItems: "center", justifyContent: "center",
    borderRadius: "50%",
    border: `1px solid ${isDark ? "rgba(214, 227, 245, 0.24)" : "rgba(35, 52, 73, 0.18)"}`,
    background: isDark ? "rgba(18, 32, 48, 0.94)" : "rgba(248, 250, 253, 0.96)",
    boxShadow: isDark
      ? "0 8px 20px rgba(1, 7, 16, 0.34), inset 0 1px 0 rgba(255,255,255,0.10)"
      : "0 8px 18px rgba(35, 51, 70, 0.16), inset 0 1px 0 rgba(255,255,255,0.86)"
  });

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "68");
  svg.setAttribute("height", "68");
  svg.style.cssText = "position:absolute; pointer-events: none;";

  const circleBg = document.createElementNS("http://www.w3.org/2000/svg", "path");
  circleBg.id = "bubbleRingTrack";
  circleBg.setAttribute("d", "M34 5 A29 29 0 0 0 34 63");
  circleBg.setAttribute("stroke", isDark ? "rgba(255,255,255,0.13)" : "rgba(31,41,55,0.10)");
  circleBg.setAttribute("stroke-width", "3");
  circleBg.setAttribute("fill", "none");

  const circleRing = document.createElementNS("http://www.w3.org/2000/svg", "path");
  circleRing.id = "bubbleRing";
  circleRing.setAttribute("d", "M34 5 A29 29 0 0 0 34 63");
  circleRing.setAttribute("stroke", "#ffb12d"); circleRing.setAttribute("stroke-width", "3.5");
  circleRing.setAttribute("fill", "none");
  circleRing.setAttribute("stroke-dasharray", "91"); circleRing.setAttribute("stroke-dashoffset", "91");
  circleRing.setAttribute("stroke-linecap", "round");
  circleRing.style.transition = "stroke-dashoffset 0.65s cubic-bezier(0.25, 1, 0.5, 1)";
  circleRing.style.filter = "drop-shadow(0 0 3px rgba(255,177,45,0.45))";

  const circleFlow = document.createElementNS("http://www.w3.org/2000/svg", "path");
  circleFlow.id = "bubbleRingFlow";
  circleFlow.setAttribute("d", "M34 5 A29 29 0 0 0 34 63");
  circleFlow.setAttribute("stroke", isDark ? "rgba(255, 216, 145, 0.62)" : "rgba(226, 136, 0, 0.52)");
  circleFlow.setAttribute("stroke-width", "1.35");
  circleFlow.setAttribute("stroke-dasharray", "1.4 5.2");
  circleFlow.setAttribute("fill", "none");
  circleFlow.setAttribute("stroke-linecap", "round");
  circleFlow.style.animation = "focusBubbleRingFlow 1.35s linear infinite";

  svg.appendChild(circleBg);
  svg.appendChild(circleRing);
  svg.appendChild(circleFlow);

  const minsSpan = document.createElement('span');
  minsSpan.id = "pomoMins";
  minsSpan.style.cssText = `font-size: 14px; font-weight: 750; font-family: 'Segoe UI', sans-serif; letter-spacing:-0.02em; color:${isDark ? '#f4f7fb' : '#172033'}; transform:${isDistracted ? 'translateX(0)' : 'translateX(-10px)'}; transition:transform .28s cubic-bezier(.25,1,.5,1);`;
  minsSpan.innerText = "--";

  pomoContainer.appendChild(svg);
  pomoContainer.appendChild(minsSpan);

  // Create Content Container (State 2)
  const bubbleContent = document.createElement('div');
  bubbleContent.id = "bubbleContent";
  Object.assign(bubbleContent.style, {
    display: isDistracted ? 'flex' : 'none',
    position: 'relative',
    inset: "auto",
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: "0 10px 0 0",
    height: "100%",
    width: "auto",
    boxSizing: "border-box",
    maxWidth: "100%",
    overflow: "hidden",
    flex: "0 1 auto"
  });

  // Text Container
  const textContainer = document.createElement('div');
  textContainer.style.cssText = "display:flex;flex:0 1 auto;min-width:0;flex-direction:column;justify-content:center;padding:0 10px 0 12px;overflow:hidden;";

  const targetLabel = document.createElement('div');
  targetLabel.innerText = "FOCUS INTENT";
  targetLabel.style.cssText = `font-size:8px; font-weight:750; color:${isDark ? 'rgba(221,232,246,0.58)' : 'rgba(31,41,55,0.52)'}; letter-spacing:0.11em; margin-bottom:3px;`;

  const timerDetail = document.createElement('div');
  timerDetail.id = "bubbleTimerDetail";
  timerDetail.innerText = "--:-- LEFT";
  timerDetail.style.cssText = `font-size:10px; font-weight:750; color:${isDark ? '#ffc35a' : '#a45c00'}; letter-spacing:0.07em; margin-bottom:4px;`;

  const goalTextEl = document.createElement('div');
  goalTextEl.id = "bubbleGoalText";
  // Truncate text strictly to 15 chars + ...
  const displayGoal = goal.length > 15 ? goal.substring(0, 15) + "..." : goal;
  goalTextEl.innerText = displayGoal;
  goalTextEl.title = goal; // Tooltip for full text

  goalTextEl.style.cssText = `
    color: ${isDark ? '#f4f7fb' : '#172033'};
    font-weight: 650;
    font-size: 13px; 
    line-height: 1.3;
    overflow: hidden;
    white-space: nowrap;
  `;

  textContainer.appendChild(timerDetail);
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
    width:34px; height:34px; flex-shrink:0;
    border:1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(47,65,85,0.14)'};
    border-radius:50%;
    background:${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.52)'};
    color:${isDark ? '#d6e2f2' : '#41536b'};
    display:flex; align-items:center; justify-content:center; 
    transition:all 0.2s ease;
  `;

  quizBtn.onmouseover = () => {
    quizBtn.style.background = isDark ? 'rgba(244,166,42,0.18)' : 'rgba(244,166,42,0.18)';
    quizBtn.style.color = '#df8a09';
    quizBtn.style.transform = 'scale(1.08)';
  };
  quizBtn.onmouseout = () => {
    quizBtn.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.52)';
    quizBtn.style.color = isDark ? '#d6e2f2' : '#41536b';
    quizBtn.style.transform = 'scale(1)';
  };

  quizBtn.onclick = (e) => {
    e.stopPropagation();
    renderRecallSetupModal();
  };

  const endFocusBtn = document.createElement('button');
  endFocusBtn.id = "focus-end-session";
  endFocusBtn.type = "button";
  endFocusBtn.title = "End focus session";
  endFocusBtn.setAttribute("aria-label", "End focus session");
  endFocusBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m7 7 10 10M17 7 7 17"/></svg>';
  endFocusBtn.style.cssText = "cursor:pointer;margin-left:6px;width:26px;height:26px;padding:0;flex-shrink:0;border:1px solid rgba(255,93,93,0.88);border-radius:50%;background:rgba(255,58,58,0.20);color:#ff5c5c;box-shadow:0 0 10px rgba(255,55,55,0.24),inset 0 1px 0 rgba(255,255,255,0.16);display:flex;align-items:center;justify-content:center;";
  endFocusBtn.onclick = (e) => {
    e.stopPropagation();
    // Clear this tab first. Other open tabs independently receive the same
    // state change below, so a delayed background broadcast cannot leave a
    // nudge presentation behind.
    clearNudgePresentation();
    chrome.storage.local.remove(['userGoal', 'sessionActive', 'subTasks', 'pomoActive', 'pomoEndTime', 'workDuration', 'currentStartTime', 'milestonesReached', 'todaysGoal', 'todaysGoalTimestamp', 'todaysGoalDate'], () => {
      chrome.alarms.clearAll();
      chrome.runtime.sendMessage({ action: "broadcastEndSession" });
    });
  };

  bubbleContent.appendChild(textContainer);
  bubbleContent.appendChild(quizBtn);
  bubbleContent.appendChild(endFocusBtn);

  bubble.appendChild(pomoContainer);
  bubble.appendChild(bubbleContent);

  document.documentElement.appendChild(bubble);

  // Hover Interactions
  bubble.onmouseenter = () => { if (isValid() && !isDistractionMode) expandBubble(); };
  bubble.onmouseleave = () => { if (isValid() && !isDistractionMode) collapseBubble(); };

  // Drag Logic
  let isDragging = false;
  bubble.onmousedown = (e) => {
    if (e.target.closest('#focus-quiz-btn, #focus-end-session')) return;
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
      bubble.style.transition = "width 0.28s cubic-bezier(0.25, 1, 0.5, 1), left 0.28s cubic-bezier(0.25, 1, 0.5, 1), right 0.28s cubic-bezier(0.25, 1, 0.5, 1), border-radius 0.28s, background 0.3s, box-shadow 0.3s";
      bubble.dataset.snappedSide = (bubble.getBoundingClientRect().left + bubble.offsetWidth / 2) < window.innerWidth / 2 ? 'left' : 'right';
      if (isDistractionMode) {
        const isLeft = bubble.dataset.snappedSide === 'left';
        bubble.style.left = isLeft ? '16px' : 'auto';
        bubble.style.right = isLeft ? 'auto' : '16px';
      } else {
        collapseBubble();
      }
    };
  };
}

function syncBubbleProgressSide(side) {
  const arc = side === 'left'
    ? "M34 5 A29 29 0 0 1 34 63"
    : "M34 5 A29 29 0 0 0 34 63";
  document.getElementById("bubbleRing")?.setAttribute("d", arc);
  document.getElementById("bubbleRingTrack")?.setAttribute("d", arc);
  document.getElementById("bubbleRingFlow")?.setAttribute("d", arc);
}

function expandBubble() {
  const bubble = document.getElementById("focus-bubble-root");
  const pomo = document.getElementById("pomoContainer");
  const content = document.getElementById("bubbleContent");
  const mins = document.getElementById("pomoMins");
  if (!bubble) return;
  if (bubble.dataset.variant === "nudge") return;

  const isLeft = bubble.dataset.snappedSide === 'left';
  syncBubbleProgressSide(isLeft ? 'left' : 'right');
  bubble.dataset.expanded = "true";
  setBubbleCardSurface(bubble, true);
  bubble.style.width = "auto";
  bubble.style.borderRadius = "34px";
  bubble.style.paddingRight = "7px";
  bubble.style.left = isLeft ? "0" : "auto";
  bubble.style.right = isLeft ? "auto" : "0";
  if (mins) mins.style.transform = "translateX(0)";
  if (pomo) pomo.style.marginLeft = "0";

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
  const mins = document.getElementById("pomoMins");
  if (bubble && !isDistractionMode) {
    const isLeft = bubble.dataset.snappedSide === 'left';
    syncBubbleProgressSide(isLeft ? 'left' : 'right');
    bubble.dataset.expanded = "false";
    setBubbleCardSurface(bubble, false);
    bubble.style.width = "68px";
    bubble.style.borderRadius = "50%";
    bubble.style.paddingRight = "0";
    bubble.style.left = isLeft ? "-34px" : "auto";
    bubble.style.right = isLeft ? "auto" : "-34px";
    if (mins) mins.style.transform = isLeft ? "translateX(10px)" : "translateX(-10px)";
    if (pomo) pomo.style.marginLeft = "0";
    if (content) content.style.display = "none";
    if (pomo) pomo.style.display = "flex";
  }
}

function clearNudgePresentation() {
  isNudgeActive = false;
  isDistractionMode = false;
  bodyguard.disconnect();
  document.getElementById("focus-bridge-glow-top")?.remove();
  document.getElementById("focus-bridge-nudge-buddy")?.remove();
  collapseBubble();
}

// 5. POMODORO SYNC
setInterval(async () => {
  if (!isValid()) return;
  chrome.storage.local.get(['pomoActive', 'pomoEndTime', 'workDuration'], (res) => {
    if (chrome.runtime.lastError || !res) return;
    const ring = document.getElementById("bubbleRing");
    const minsTxt = document.getElementById("pomoMins");
    const timerDetail = document.getElementById("bubbleTimerDetail");
    const bubble = document.getElementById("focus-bubble-root");
    if (!ring || !minsTxt) return;
    if (!res.pomoActive) {
      if (pomoWasActive) {
        document.getElementById("focus-bubble-root")?.remove();
        document.getElementById("focus-bridge-glow-top")?.remove();
        document.getElementById("focus-bridge-nudge-buddy")?.remove();
        pomoWasActive = false;
      }
      ring.style.strokeDashoffset = 91;
      minsTxt.innerText = "--";
      if (timerDetail) timerDetail.innerText = "TIMER ENDED";
      return;
    }
    pomoWasActive = true;
    const remaining = Math.max(0, res.pomoEndTime - Date.now());
    const remainingMinutes = Math.floor(remaining / 60000);
    const remainingSeconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
    minsTxt.innerText = bubble?.dataset.expanded === "true"
      ? remainingMinutes + "m"
      : remainingMinutes;
    if (timerDetail) timerDetail.innerText = `${remainingMinutes}:${remainingSeconds} LEFT`;
    // The gold arc begins empty, then fills as the Pomodoro elapsed time grows.
    ring.style.strokeDashoffset = 91 * (remaining / (res.workDuration * 60000));
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
      const errorTitle = document.createElement('h3');
      errorTitle.textContent = 'Connection Error';
      errorTitle.style.cssText = 'color:#d32f2f; margin-top:0;';
      const errorText = document.createElement('p');
      errorText.textContent = errorMsg;
      errorText.style.cssText = `color:${subTextColor}; font-size:13px; margin-bottom:20px;`;
      const closeErrorBtn = document.createElement('button');
      closeErrorBtn.id = 'closeErrorBtn';
      closeErrorBtn.type = 'button';
      closeErrorBtn.textContent = 'Close';
      closeErrorBtn.style.cssText = `padding:8px 20px; background:#ddd; color:${textColor}; border:none; border-radius:6px; cursor:pointer; font-weight:bold;`;
      errDiv.append(errorTitle, errorText, closeErrorBtn);
      wrapper.appendChild(errDiv);

      closeErrorBtn.onclick = () => {
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

  const isDark = currentTheme === 'dark';
  const overlayBase = isDark ? '#090d14' : '#e8eef5';
  const panelBackground = isDark ? 'rgba(13, 24, 39, .84)' : 'rgba(248, 251, 255, .84)';
  const primaryText = isDark ? '#f3f7fc' : '#182536';
  const mutedText = isDark ? 'rgba(225, 234, 246, .72)' : 'rgba(42, 57, 76, .72)';
  const panelBorder = isDark ? 'rgba(177, 205, 235, .28)' : 'rgba(54, 80, 110, .24)';

  const overlay = document.createElement("div");
  overlay.id = "focus-buddy-overlay";
  overlay.style.cssText = `
    position:fixed !important; inset:0; z-index:2147483647; display:grid; place-items:center;
    overflow:auto; box-sizing:border-box; padding:24px; color:${primaryText};
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; text-align:center;
    background:radial-gradient(ellipse at 16% 12%,rgba(255,159,31,.22),transparent 36%),radial-gradient(ellipse at 88% 92%,rgba(90,119,255,.14),transparent 42%),${overlayBase};
    backdrop-filter:blur(9px); -webkit-backdrop-filter:blur(9px);
  `;

  const buddyBox = document.createElement('div');
  buddyBox.id = "buddyBox";
  Object.assign(buddyBox.style, {
    width: "min(100%, 540px)", boxSizing: "border-box", border: `1px solid ${panelBorder}`, padding: "clamp(28px, 5vw, 44px)",
    borderRadius: "28px", background: panelBackground, boxShadow: isDark ? "0 28px 76px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.12)" : "0 28px 76px rgba(31,51,78,.22), inset 0 1px 0 rgba(255,255,255,.8)",
    backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", transform: "translateY(10px)", opacity: "0", transition: "transform .28s cubic-bezier(.2,.8,.2,1), opacity .22s ease, border-color .2s ease"
  });

  const h1 = document.createElement('h1');
  h1.innerText = "Pause before you drift.";
  h1.style.cssText = `color:${primaryText};margin:0 0 13px;font-size:clamp(26px,5vw,34px);line-height:1.08;letter-spacing:-.04em;`;

  const p1 = document.createElement('p');
  p1.style.cssText = `font-size:16px;line-height:1.5;color:${mutedText};margin:0 auto 18px;max-width:440px;`;
  p1.innerText = "";
  p1.append("You chose to focus on ");
  const strong = document.createElement('strong'); strong.innerText = `"${goal}"`;
  p1.append(strong);
  p1.append(".");

  const p2 = document.createElement('p');
  p2.style.cssText = `color:${mutedText};font-size:13px;line-height:1.6;margin:0 auto 27px;max-width:408px;`;
  p2.innerText = "Once you enter this site, time may fly and we won't be able to recover that delay. Take 10 seconds to breathe—is this really where you want to be right now? I'm trying to help you, not hold you back.";

  const btnContainer = document.createElement('div');
  btnContainer.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:11px;max-width:430px;margin:0 auto;";

  const backBtn = document.createElement('button');
  backBtn.id = "backToWorkBtn";
  backBtn.innerHTML = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m10 17-5-5 5-5M5 12h14"/></svg><span>Get back to work</span>';
  backBtn.style.cssText = "min-height:52px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;background:linear-gradient(135deg,#ffc152,#ef9218);border:1px solid rgba(255,220,143,.82);border-radius:14px;font-weight:800;cursor:pointer;color:#171007;font-size:13px;letter-spacing:.01em;box-shadow:0 10px 22px rgba(238,143,23,.24);transition:transform .18s ease,box-shadow .18s ease;";

  const accessBtn = document.createElement('button');
  accessBtn.id = "accessBtn";
  accessBtn.disabled = true;
  accessBtn.style.cssText = `min-height:52px;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:12px 14px;background:rgba(255,255,255,.055);border:1px solid ${panelBorder};border-radius:14px;color:${isDark ? 'rgba(225,234,246,.42)' : 'rgba(42,57,76,.48)'};cursor:not-allowed;font-size:13px;font-weight:700;transition:background .18s ease,border-color .18s ease,color .18s ease,transform .18s ease;`;
  // "Wait <span id='buddyTimer'>10</span>s..."
  accessBtn.append("Wait ");
  const timerSpan = document.createElement('span');
  timerSpan.id = "buddyTimer";
  timerSpan.innerText = "10";
  accessBtn.append(timerSpan);
  accessBtn.append("s to continue");

  btnContainer.appendChild(backBtn);
  btnContainer.appendChild(accessBtn);

  buddyBox.appendChild(h1);
  buddyBox.appendChild(p1);
  buddyBox.appendChild(p2);
  buddyBox.appendChild(btnContainer);

  overlay.appendChild(buddyBox);

  document.documentElement.appendChild(overlay);
  requestAnimationFrame(() => { buddyBox.style.opacity = '1'; buddyBox.style.transform = 'translateY(0)'; });

  let t = 10;
  const int = setInterval(() => {
    if (!isValid()) { clearInterval(int); return; }
    t--;
    if (timerSpan.isConnected) timerSpan.innerText = t;
    if (t <= 0) {
      clearInterval(int);
      if (accessBtn.isConnected) {
        const btn = accessBtn;
        btn.disabled = false;
        btn.innerHTML = '<span>I understand, continue</span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
        btn.style.color = primaryText;
        btn.style.borderColor = isDark ? 'rgba(196,215,240,.42)' : 'rgba(53,76,106,.36)';
        btn.style.background = isDark ? 'rgba(255,255,255,.095)' : 'rgba(255,255,255,.74)';
        btn.style.cursor = "pointer";
      }
    }
  }, 1000);

  // THE REWARD REDIRECT
  backBtn.onclick = () => {
    clearInterval(int);
    const box = buddyBox;
    box.style.transform = "scale(0.95)";
    box.innerHTML = '';
    const h1Reward = document.createElement('h1');
    h1Reward.innerText = "Legendary Choice!";
    h1Reward.style.cssText = "color:#5fd59a;font-size:30px;margin:0 0 12px;";

    const pReward = document.createElement('p');
    pReward.style.cssText = `font-size:16px;line-height:1.5;color:${primaryText};margin:0;`;
    pReward.append("Returning to your path: ");
    const strongReward = document.createElement('strong');
    strongReward.innerText = goal;
    pReward.append(strongReward);

    box.appendChild(h1Reward);
    box.appendChild(pReward);
    box.style.borderColor = "rgba(95,213,154,.72)";

    fireRibbons('big'); // Explosive reward!

    setTimeout(() => {
      window.location.href = "https://www.google.com";
    }, 2500);
  };

  accessBtn.onclick = () => {
    if (accessBtn.disabled) return;
    clearInterval(int);
    isDistractionMode = true; // Stay expanded
    overlay.remove();
  };
}

function ensureNextBravoFont() {
  if (!nextBravoFontPromise) {
    const source = `url("${chrome.runtime.getURL('assets/fonts/Next_Bravo.ttf')}") format("truetype")`;
    nextBravoFontPromise = new FontFace('Next Bravo Sticker', source, { weight: '400', style: 'normal' }).load()
      .then(face => { document.fonts.add(face); return true; })
      .catch(error => { console.error('[FocusBridge] Next Bravo font failed to load:', error); return false; });
  }
  return nextBravoFontPromise;
}

async function fireRibbons(type) {
  if (!isValid() || document.hidden || !boostStickersEnabled) return;
  const fontLoaded = await ensureNextBravoFont();
  if (!fontLoaded) return;
  document.getElementById("focus-boost-sticker")?.remove();
  if (!document.getElementById("focus-boost-sticker-style")) {
    const style = document.createElement("style");
    style.id = "focus-boost-sticker-style";
    style.textContent = `@keyframes focusBoostSticker { 0% { opacity:0; transform:translateY(42px) scale(.84) rotate(-4deg); } 12% { opacity:1; transform:translateY(0) scale(1.04) rotate(0); } 68% { opacity:1; transform:translateY(-280px) scale(1); } 100% { opacity:0; transform:translateY(-520px) scale(.90); } }`;
    document.documentElement.appendChild(style);
  }
  const copySets = type === 'milestone-30'
    ? [['SETTLE', 'IN'], ['STAY', 'PRESENT'], ['BUILD', 'RHYTHM'], ['ONE', 'TASK'], ['KEEP', 'STEADY']]
    : type === 'milestone-60'
      ? [['HALF', 'WAY'], ['DEEP', 'FOCUS'], ['KEEP', 'FLOWING'], ['MOMENTUM', 'ON'], ['STAY', 'WITH IT']]
      : type === 'milestone-90'
        ? [['FINAL', 'STRETCH'], ['CLOSE', 'STRONG'], ['NEARLY', 'DONE'], ['LAST', 'MINUTES'], ['FINISH', 'CLEAN']]
        : type === 'big'
          ? [['BACK', 'ON TRACK'], ['RETURN', 'TO GOAL'], ['FOCUS', 'RESET']]
          : [['TIMER', 'DONE'], ['FOCUS', 'COMPLETE'], ['YOU', 'MADE IT'], ['SESSION', 'COMPLETE'], ['WELL', 'DONE']];
  const copy = copySets[Math.floor(Math.random() * copySets.length)];
  const sticker = document.createElement("div");
  sticker.id = "focus-boost-sticker";
  sticker.setAttribute("aria-hidden", "true");
  sticker.style.cssText = "position:fixed;right:22px;bottom:28px;z-index:2147483647;pointer-events:none;text-align:right;animation:focusBoostSticker 3s cubic-bezier(.18,.82,.25,1) both;";
  const stickerShadow = sticker.attachShadow({ mode: 'closed' });
  stickerShadow.innerHTML = `<style>.copy{color:#ffe7a7;font-family:'Next Bravo Sticker' !important;font-weight:400 !important;font-style:normal !important;line-height:.78;letter-spacing:-.05em;text-shadow:3px 3px 0 #6d3300,0 0 18px rgba(255,151,0,.88)}.copy span{display:block;font-family:inherit !important}.top{font-size:34px}.bottom{font-size:48px}</style><div class="copy"><span class="top">${copy[0]}</span><span class="bottom">${copy[1]}</span></div>`;
  document.documentElement.appendChild(sticker);
  setTimeout(() => sticker.remove(), 3100);
  return;

  document.getElementById("celebration-canvas")?.remove();
  const canvas = document.createElement('canvas');
  canvas.id = "celebration-canvas";
  Object.assign(canvas.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: '2147483647' });
  document.documentElement.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const colors = ['#ffd36e', '#ff9f1c', '#ff6b35', '#7dd3fc'];
  const p = [];
  for (let i = 0; i < (type === 'big' ? 92 : 42); i++) {
    p.push({ x: canvas.width - 8 - Math.random() * 68, y: canvas.height + Math.random() * 90, w: Math.random() * 3 + 2, h: Math.random() * 20 + 24, c: colors[Math.floor(Math.random() * colors.length)], s: Math.random() * 9 + 15, drift: Math.random() * 1.2 - .6 });
  }
  function anim() {
    if (!isValid()) return; ctx.clearRect(0, 0, canvas.width, canvas.height); let v = false;
    p.forEach(particle => {
      particle.y -= particle.s; particle.x += particle.drift;
      if (particle.y > -particle.h) {
        v = true; ctx.save(); ctx.translate(particle.x, particle.y); ctx.fillStyle = particle.c;
        ctx.shadowColor = particle.c; ctx.shadowBlur = 9;
        ctx.fillRect(-particle.w / 2, particle.h * .37, particle.w, particle.h * .63);
        ctx.beginPath(); ctx.moveTo(-particle.w * 2.3, particle.h * .45); ctx.lineTo(0, 0); ctx.lineTo(particle.w * 2.3, particle.h * .45); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    });
    if (v) requestAnimationFrame(anim); else canvas.remove();
  } anim();
}

// 8. MASTER MESSAGE LISTENER
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!isValid()) return;

  if (request.action === "requestContext") {
    // Prefer semantic page content over navigation, cookie banners, and app chrome.
    // The background combines this with the title and caps it at 2,000 characters.
    const contentRoot = document.querySelector('main, article') || document.body;
    let bodySnippet = contentRoot?.innerText || "";
    bodySnippet = bodySnippet
      .replace(/^(?:\s*(?:accept|reject|manage|cookie settings|privacy settings|allow)\b[^\n]{0,120}\n?)+/i, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 2000);
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
    clearNudgePresentation();
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
    document.getElementById("focus-bridge-nudge-buddy")?.remove();
    document.getElementById("focus-buddy-overlay")?.remove();
    document.getElementById("recall-anchor-overlay")?.remove();
    sendResponse({ status: "ok" });
  }
  else if (request.action === "timerEnded") {
    pomoWasActive = false;
    document.getElementById("focus-bubble-root")?.remove();
    document.getElementById("focus-bridge-glow-top")?.remove();
    document.getElementById("focus-bridge-nudge-buddy")?.remove();
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
chrome.storage.local.get(['sessionActive', 'userGoal', 'recallActive', 'screenshotToolEnabled', 'screenshotHoldEnabled', 'notepadToolEnabled', 'notepadHoldEnabled', 'unitConverterToolEnabled', 'unitConverterHoldEnabled', 'attentionCheckEnabled', 'theme', 'nudgeBuddyEnabled', 'boostStickersEnabled', 'userName'], (res) => {
  if (!isValid()) return;
  currentTheme = res.theme !== 'light' ? 'dark' : 'light';
  nudgeBuddyEnabled = !!res.nudgeBuddyEnabled;
  boostStickersEnabled = res.boostStickersEnabled !== false;
  screenshotHoldEnabled = res.screenshotHoldEnabled === true;
  screenshotToolEnabled = res.screenshotToolEnabled === true;
  notepadToolEnabled = res.notepadToolEnabled === true;
  unitConverterToolEnabled = res.unitConverterToolEnabled === true;
  attentionCheckEnabled = res.attentionCheckEnabled === true;
  notepadHoldEnabled = res.notepadHoldEnabled === true;
  unitConverterHoldEnabled = res.unitConverterHoldEnabled === true;
  focusUserName = (res.userName || '').trim();
  renderGlobalToolsDock();

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
  // Ending a session removes sessionActive rather than setting it to false.
  // Every injected page observes that change so a distraction tab clears its
  // owl, orange cue, and expanded state even if it misses a runtime message.
  if (changes.sessionActive && changes.sessionActive.newValue !== true) {
    clearNudgePresentation();
  }
  if (changes.sessionActive?.newValue === true) {
    const goal = changes.userGoal?.newValue;
    if (goal) {
      isNudgeActive = true;
      isDistractionMode = false;
      activeGoalText = goal;
      renderFocusBubble(goal, false);
      bodyguard.observe(document.documentElement, { childList: true, subtree: true });
    }
  }
  if (isValid() && changes.theme) updateBubbleTheme(changes.theme.newValue);
  if (changes.nudgeBuddyEnabled) nudgeBuddyEnabled = !!changes.nudgeBuddyEnabled.newValue;
  if (changes.boostStickersEnabled) boostStickersEnabled = changes.boostStickersEnabled.newValue !== false;
  if (changes.screenshotHoldEnabled) screenshotHoldEnabled = changes.screenshotHoldEnabled.newValue === true;
  if (changes.screenshotToolEnabled) screenshotToolEnabled = changes.screenshotToolEnabled.newValue === true;
  if (changes.notepadToolEnabled) notepadToolEnabled = changes.notepadToolEnabled.newValue === true;
  if (changes.unitConverterToolEnabled) unitConverterToolEnabled = changes.unitConverterToolEnabled.newValue === true;
  if (changes.attentionCheckEnabled) attentionCheckEnabled = changes.attentionCheckEnabled.newValue === true;
  if (changes.notepadHoldEnabled) notepadHoldEnabled = changes.notepadHoldEnabled.newValue === true;
  if (changes.unitConverterHoldEnabled) unitConverterHoldEnabled = changes.unitConverterHoldEnabled.newValue === true;
  if (changes.userName) focusUserName = (changes.userName.newValue || '').trim();
  if (isValid() && changes.recallActive) {
    recallActive = changes.recallActive.newValue;
  }
});

// 11. CONFETTI CELEBRATION
// 11. CONFETTI CELEBRATION
function launchConfetti(type = 'finish') {
  fireRibbons(type);
  return;

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
    clearNudgePresentation();
    const flash = document.getElementById("focus-bridge-glow-top");
    if (flash) flash.remove();
    document.getElementById("focus-bridge-nudge-buddy")?.remove();

    // Also remove any overlays if present
    const overlay = document.getElementById("focus-overlay-root");
    if (overlay) overlay.remove();
  }
});

chrome.storage.onChanged.addListener(changes => {
  if (!changes.screenshotToolEnabled && !changes.notepadToolEnabled && !changes.unitConverterToolEnabled && !changes.attentionCheckEnabled) return;
  const dock = document.getElementById('focusbridge-global-tools-root');
  if (changes.screenshotToolEnabled) screenshotToolEnabled = changes.screenshotToolEnabled.newValue === true;
  if (changes.notepadToolEnabled) notepadToolEnabled = changes.notepadToolEnabled.newValue === true;
  if (changes.unitConverterToolEnabled) unitConverterToolEnabled = changes.unitConverterToolEnabled.newValue === true;
  if (changes.attentionCheckEnabled) attentionCheckEnabled = changes.attentionCheckEnabled.newValue === true;
  cleanupToolsDock?.();
  dock?.remove();
  if (isValid()) renderGlobalToolsDock();
});
