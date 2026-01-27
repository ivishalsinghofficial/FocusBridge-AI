export function getDomain(url) {
    try { return new URL(url).hostname.replace('www.', ''); } catch (e) { return ""; }
}

export async function updateSmartSuggest() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    const domain = getDomain(tab.url);
    const textEl = document.getElementById('currentDomainText');
    if (domain && !tab.url.startsWith('chrome')) {
        textEl.innerText = domain;
        document.getElementById('quickAddSafe').onclick = () => addRule(domain, 'safe');
        document.getElementById('quickAddBlock').onclick = () => addRule(domain, 'block');
    } else { textEl.innerText = "System Page"; }
}

export function addRule(domain, type) {
    chrome.storage.local.get(['blocklist', 'allowlist'], (res) => {
        let bl = res.blocklist || []; let al = res.allowlist || [];
        if (type === 'block') {
            if (!bl.includes(domain)) bl.push(domain);
            al = al.filter(i => i !== domain);
        } else {
            if (!al.includes(domain)) al.push(domain);
            bl = bl.filter(i => i !== domain);
        }
        chrome.storage.local.set({ blocklist: bl, allowlist: al }, renderRulesLedger);
    });
}

export function renderRulesLedger() {
    chrome.storage.local.get(['blocklist', 'allowlist'], (res) => {
        const container = document.getElementById('rulesLedger');
        if (!container) return;
        container.innerHTML = '';
        const all = [...(res.blocklist || []).map(d => ({ d, t: 'block' })), ...(res.allowlist || []).map(d => ({ d, t: 'safe' }))];

        if (all.length === 0) {
            container.innerHTML = '<div style="padding:20px;text-align:center;color:#ccc;font-size:11px;">No manual rules set.</div>';
            return;
        }

        all.forEach(rule => {
            const row = document.createElement('div');
            row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;";
            const isBlock = rule.t === 'block';

            row.innerHTML = `
        <span style="flex-grow:1; font-family:monospace; font-size:12px;">${rule.d}</span>
        <span style="background:${isBlock ? '#fee' : '#efe'}; color:${isBlock ? '#c33' : '#282'}; padding:2px 8px; border-radius:10px; font-size:9px; text-transform:uppercase; margin-right:12px; font-weight:bold; border:1px solid ${isBlock ? '#fcc' : '#cba'};">${rule.t}</span>
        <button class="trash-btn" style="background:#ff4444; color:white; border:none; border-radius:4px; width:50px; height:20px; cursor:pointer; font-size:9px; font-weight:bold; display:flex; align-items:center; justify-content:center;">Delete</button>
      `;

            row.querySelector('.trash-btn').onclick = () => {
                const key = isBlock ? 'blocklist' : 'allowlist';
                chrome.storage.local.get([key], (data) => {
                    chrome.storage.local.set({ [key]: (data[key] || []).filter(item => item !== rule.d) }, renderRulesLedger);
                });
            };
            container.appendChild(row);
        });
    });
}
