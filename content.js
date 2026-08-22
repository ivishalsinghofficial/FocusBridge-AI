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

function renderGlobalToolsDock() {
  if (!isValid() || document.getElementById('focusbridge-global-tools-root')) return;
  const host = document.createElement('div');
  host.id = 'focusbridge-global-tools-root';
  host.style.cssText = 'all:initial;position:fixed;z-index:2147483647;top:0;left:0;';
  const shadow = host.attachShadow({ mode: 'closed' });
  shadow.innerHTML = [
    '<style>',
    '*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '#rail{position:fixed;right:-12px;top:50%;transform:translateY(-50%);display:grid;gap:9px}.tool-bubble{appearance:none;display:grid;place-items:center;width:46px;height:42px;border:1px solid rgba(255,255,255,.22);border-radius:999px 0 0 999px;background:rgba(16,17,20,.86);color:#e8c56e;padding:0 12px 0 5px;cursor:pointer;box-shadow:0 12px 28px rgba(0,0,0,.25);font-size:16px;font-weight:700;transition:transform .18s ease,background .2s ease}.tool-bubble svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.tool-bubble:hover{transform:translateX(-4px);background:rgba(43,39,31,.96)}',
    '#panel{position:fixed;right:14px;top:50%;width:280px;transform:translate(110%,-50%);padding:16px;color:#f6f3ec;background:rgba(17,18,21,.94);border:1px solid rgba(255,255,255,.18);border-radius:16px;box-shadow:-18px 16px 42px rgba(0,0,0,.34);backdrop-filter:blur(18px);transition:transform .24s cubic-bezier(.2,.8,.2,1)}#panel.open{transform:translate(-68px,-50%)}',
    '.head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}#close{appearance:none;border:0;background:transparent;color:#f6f3ec;cursor:pointer;font-size:21px;line-height:1;padding:0 2px}',
    '#display{width:100%;height:44px;border:1px solid rgba(255,255,255,.18);border-radius:10px;background:rgba(0,0,0,.22);color:#fff;padding:0 12px;margin-bottom:9px;text-align:right;font-size:19px;outline:none}.keys{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}',
    '.key,.action{appearance:none;border:1px solid rgba(255,255,255,.14);border-radius:9px;background:rgba(255,255,255,.07);color:#f8f5ee;min-height:36px;cursor:pointer;font-size:14px}.key:hover,.action:hover{background:rgba(210,178,102,.18);border-color:rgba(223,196,128,.38)}.key.operator{color:#e8c56e}.key.equals{background:#d7b45a;color:#17140c;font-weight:800}.actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:13px}.action{min-height:40px;font-size:12px;font-weight:650}#status{min-height:16px;margin:10px 1px 0;color:#cfc8bb;font-size:11px;text-align:center}@media(max-width:430px){#panel{width:260px}.tool-bubble{padding:9px}.tool-bubble span:last-child{display:none}}',
    '</style><section id="panel" aria-label="FocusBridge tools" aria-hidden="true"><div class="head"><span>Focus tools</span><button id="close" type="button" aria-label="Close tools">×</button></div><input id="display" aria-label="Calculator display" value="0" readonly><div class="keys" aria-label="Calculator">',
    '<button class="key operator" data-key="C">C</button><button class="key operator" data-key="(">(</button><button class="key operator" data-key=")">)</button><button class="key operator" data-key="/">÷</button><button class="key" data-key="7">7</button><button class="key" data-key="8">8</button><button class="key" data-key="9">9</button><button class="key operator" data-key="*">×</button><button class="key" data-key="4">4</button><button class="key" data-key="5">5</button><button class="key" data-key="6">6</button><button class="key operator" data-key="-">−</button><button class="key" data-key="1">1</button><button class="key" data-key="2">2</button><button class="key" data-key="3">3</button><button class="key operator" data-key="+">+</button><button class="key" data-key="0">0</button><button class="key" data-key=".">.</button><button class="key" data-key="back">⌫</button><button class="key equals" data-key="=">=</button>',
    '</div><div id="status" role="status" aria-live="polite"></div></section><div id="rail" aria-label="FocusBridge quick tools"><button id="screenshot" class="tool-bubble" type="button" title="Capture area" aria-label="Capture area"><svg viewBox="0 0 24 24"><path d="M4 8V5h3M16 5h3v3M20 16v3h-3M8 20H5v-3"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg></button><button id="history" class="tool-bubble" type="button" title="Recent captures" aria-label="Recent captures"><svg viewBox="0 0 24 24"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg></button></div>'
  ].join('');
  const panel = shadow.querySelector('#panel');
  const calculatorLaunch = shadow.querySelector('#calculator-launch');
  const display = shadow.querySelector('#display');
  const status = shadow.querySelector('#status');
  const setOpen = (open) => {
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    calculatorLaunch?.setAttribute('aria-expanded', String(open));
  };
  calculatorLaunch?.addEventListener('click', () => setOpen(!panel.classList.contains('open')));
  shadow.querySelector('#close').addEventListener('click', () => setOpen(false));
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
  captureLayer.innerHTML = '<div id="shade" style="position:fixed;inset:0;background:rgba(0,0,0,.62);cursor:crosshair"></div><div id="selection" style="display:none;position:fixed;border:2px solid #e8c56e;box-shadow:0 0 0 9999px rgba(0,0,0,.42);cursor:move"><div id="handle" style="position:absolute;right:-8px;bottom:-8px;width:16px;height:16px;background:#e8c56e;border:2px solid #17140c;border-radius:50%;cursor:nwse-resize"></div></div><div id="pickerBar" style="display:none;position:fixed;left:50%;bottom:28px;transform:translateX(-50%);gap:8px;padding:8px;border:1px solid rgba(255,255,255,.22);border-radius:12px;background:rgba(17,18,21,.94);box-shadow:0 12px 34px rgba(0,0,0,.35)"><button id="pickerCancel" title="Cancel" aria-label="Cancel" type="button">&#215;</button><button id="cropEdit" title="Annotate selected area" aria-label="Annotate selected area" type="button">&#9998;</button></div><div id="editor" style="display:none;position:fixed;inset:0;background:rgba(10,11,13,.97);padding:22px;text-align:center"><div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-bottom:12px"><button id="backToCrop" title="Back to selection" aria-label="Back to selection" type="button">&#8592;</button><button id="pen" title="Pen" aria-label="Pen" type="button">&#9998;</button><input id="penColor" type="color" value="#e8c56e" aria-label="Pen color"><button id="copyCrop" title="Copy to clipboard" aria-label="Copy to clipboard" type="button">&#10697;</button><button id="downloadCrop" title="Download PNG" aria-label="Download PNG" type="button">&#8681;</button><button id="closeEditor" title="Done" aria-label="Done" type="button">&#215;</button></div><canvas id="captureCanvas" style="max-width:92vw;max-height:82vh;cursor:crosshair;box-shadow:0 12px 45px rgba(0,0,0,.5)"></canvas><div id="captureStatus" style="margin-top:9px;font-size:12px;color:#d5cfbf"></div></div>';
  const captureStyle = document.createElement('style');
  captureStyle.textContent = '#pickerBar,#editor>div:first-child{border:1px solid rgba(255,255,255,.22)!important;border-radius:14px;background:rgba(17,18,21,.88)!important;backdrop-filter:blur(16px);box-shadow:0 12px 34px rgba(0,0,0,.35)}#pickerBar button,#editor button{appearance:none;display:grid;place-items:center;width:38px;height:38px;border:1px solid rgba(255,255,255,.2);border-radius:10px;background:rgba(255,255,255,.09);color:#fff;padding:0;cursor:pointer}#pickerBar button svg,#editor button svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}#penColor{width:38px;height:38px;padding:4px;border:1px solid rgba(255,255,255,.2);border-radius:10px;background:rgba(255,255,255,.09);cursor:pointer}#pickerBar button:hover,#editor button:hover{background:rgba(255,255,255,.16)}';
  shadow.append(captureStyle, captureLayer);
  const selection = captureLayer.querySelector('#selection');
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
  const saveCaptureToGallery = (dataUrl, format) => new Promise((resolve, reject) => chrome.runtime.sendMessage({ action: 'saveCapture', dataUrl, format }, response => response?.success ? resolve() : reject(new Error(response?.error || 'Could not save capture'))));
  const completeCapture = async (dataUrl, format, action) => { await action(); await saveCaptureToGallery(dataUrl, format); };
  let sourceImage, rect = {}, pointerMode = null, pointerStart, drawing = false, penEnabled = false, isCreatingSelection = false;
  const setSelection = () => Object.assign(selection.style, { left: rect.x + 'px', top: rect.y + 'px', width: rect.width + 'px', height: rect.height + 'px' });
  const closeCapture = () => { captureLayer.style.display = 'none'; editor.style.display = 'none'; pickerBar.style.display = 'none'; selection.style.display = 'none'; captureStatus.textContent = ''; captureLayer.remove(); };
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
    copyImageDirectly(dataUrl).then(() => { closeCapture(); saveCaptureToGallery(dataUrl, 'jpeg').catch(error => console.warn('FocusBridge capture save failed:', error)); }).catch(error => { captureStatus.textContent = `Copy failed: ${error.name || 'Error'} — ${error.message || 'Browser blocked clipboard access.'}`; });
  });
  quickDownload.addEventListener('click', () => {
    const dataUrl = selectedImageData(); const link = document.createElement('a'); link.href = dataUrl; link.download = 'focusbridge-capture.png'; link.click(); closeCapture(); saveCaptureToGallery(dataUrl, 'jpeg').catch(error => console.warn('FocusBridge capture save failed:', error));
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
  shadow.querySelector('#screenshot').addEventListener('click', () => {
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
          rect = {}; selection.style.display = 'none'; pickerBar.style.display = 'none'; captureLayer.style.display = 'block'; status.textContent = '';
        };
        sourceImage.src = response.dataUrl;
      });
    }, 80));
  });
  (document.documentElement || document.body).appendChild(host);
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
chrome.storage.local.get(['sessionActive', 'userGoal', 'recallActive', 'toolsDockEnabled'], (res) => {
  if (!isValid()) return;
  if (res.toolsDockEnabled !== false) renderGlobalToolsDock();

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

chrome.storage.onChanged.addListener(changes => {
  if (!changes.toolsDockEnabled) return;
  const dock = document.getElementById('focusbridge-global-tools-root');
  if (changes.toolsDockEnabled.newValue === false) dock?.remove();
  else if (!dock && isValid()) renderGlobalToolsDock();
});
