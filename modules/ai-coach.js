const COLORS = [{ name: 'RED', value: '#ef4444' }, { name: 'BLUE', value: '#3b82f6' }, { name: 'GREEN', value: '#22c55e' }, { name: 'YELLOW', value: '#eab308' }];
const TYPING_LINES = ['Small steady steps make focused work feel possible.', 'I return my attention to the task in front of me.', 'One clear minute is enough to restart momentum.'];

export function loadAIReflection() {
    chrome.storage.local.get(['history', 'userGoal'], (res) => {
        const aiText = document.getElementById('aiText');
        const mins = (res.history || {})[new Date().toISOString().split('T')[0]] || 0;
        const goal = res.userGoal || 'your goals';
        const tips = ['Take a quick reset, then return to your intent.', 'A bounded game can help attention switch back on.', 'Finish the round, then make the next work move.', 'Your focus is something you can practice.'];
        const intro = mins ? `Buddy, you've put in ${mins} solid minutes into <strong>${goal}</strong> so far. ` : `The canvas is still blank for <strong>${goal}</strong>. A short reset can make starting easier. `;
        aiText.innerHTML = `${intro}<br><br><span style="color:#ffa500;">GAME NOTE: ${tips[Math.floor(Math.random() * tips.length)]}</span>`;
        document.getElementById('coachTips').style.display = 'block';
    });
}

let activeCleanup = () => {};
const makeButton = label => { const el = document.createElement('button'); el.type = 'button'; el.textContent = label; return el; };

function openGame(title, note) {
    activeCleanup(); document.getElementById('focusGameOverlay')?.remove();
    const overlay = document.createElement('section');
    overlay.id = 'focusGameOverlay'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', title);
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2000;padding:18px;background:rgba(13,16,22,.96);color:#fff;display:flex;flex-direction:column;box-sizing:border-box;';
    const header = document.createElement('div'); header.style.cssText = 'display:flex;justify-content:space-between;gap:10px;align-items:flex-start;';
    const text = document.createElement('div'); text.innerHTML = `<strong style="font-size:18px;display:block">${title}</strong><span style="display:block;margin-top:3px;color:rgba(255,255,255,.72);font-size:11px;line-height:1.4">${note}</span>`;
    const close = makeButton('×'); close.setAttribute('aria-label', 'Close focus game'); close.style.cssText = 'width:32px;height:32px;border:1px solid rgba(255,255,255,.25);border-radius:8px;background:transparent;color:#fff;font-size:22px;cursor:pointer;';
    const status = document.createElement('p'); status.style.cssText = 'min-height:20px;margin:16px 0 10px;color:#ffd071;font-size:13px;font-weight:700;text-align:center;';
    const surface = document.createElement('div'); surface.style.cssText = 'flex:1;min-height:0;display:flex;align-items:center;justify-content:center;flex-direction:column;';
    header.append(text, close); overlay.append(header, status, surface); document.body.append(overlay);
    const closeGame = () => { activeCleanup(); overlay.remove(); activeCleanup = () => {}; };
    close.onclick = closeGame;
    return { surface, status, closeGame };
}

function finish(surface, status, message, closeGame) {
    status.textContent = message; surface.replaceChildren();
    const done = makeButton('RETURN TO FOCUS'); done.style.cssText = 'padding:12px 18px;border:0;border-radius:9px;background:#ffa500;color:#111;font-weight:800;cursor:pointer;'; done.onclick = closeGame; surface.append(done);
}

function startMaze() {
    const { surface, status, closeGame } = openGame('Mini Maze', 'Reach the flag in one small, generated maze.');
    const size = 5, links = Array.from({ length: 25 }, () => new Set()), seen = new Set([0]), stack = [0];
    while (stack.length) {
        const current = stack.at(-1), row = Math.floor(current / size), col = current % size;
        const choices = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]].filter(([r, c]) => r >= 0 && r < size && c >= 0 && c < size).map(([r, c]) => r * size + c).filter(id => !seen.has(id));
        if (!choices.length) { stack.pop(); continue; }
        const next = choices[Math.floor(Math.random() * choices.length)]; seen.add(next); links[current].add(next); links[next].add(current); stack.push(next);
    }
    let player = 0;
    const render = () => {
        const grid = document.createElement('div'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,46px);gap:5px;';
        for (let index = 0; index < 25; index++) {
            const cell = makeButton(index === player ? '●' : index === 24 ? '⚑' : ''), reachable = links[player].has(index);
            cell.disabled = !reachable; cell.style.cssText = `height:46px;border-radius:8px;border:1px solid ${reachable ? '#ffd071' : '#445'};background:${index === player ? '#ffa500' : index === 24 ? '#263f5b' : '#1f2937'};color:#fff;font-size:20px;cursor:${reachable ? 'pointer' : 'default'};`;
            cell.onclick = () => { player = index; if (player === 24) return finish(surface, status, 'Maze complete. Nice reset.', closeGame); status.textContent = 'Choose one neighboring highlighted square.'; render(); };
            grid.append(cell);
        }
        surface.replaceChildren(grid);
    };
    status.textContent = 'Start at the dot. Tap an adjacent highlighted square.'; render();
}

function startTyping() {
    const { surface, status, closeGame } = openGame('60-Second Typing Sprint', 'Match the sentence. Finish early or let the minute run out.');
    const line = TYPING_LINES[Math.floor(Math.random() * TYPING_LINES.length)], prompt = document.createElement('p'), input = document.createElement('input');
    prompt.textContent = line; prompt.style.cssText = 'margin:0 0 12px;max-width:290px;text-align:center;line-height:1.6;font-size:16px;';
    input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false; input.setAttribute('aria-label', 'Type the displayed sentence'); input.style.cssText = 'width:100%;max-width:290px;padding:12px;box-sizing:border-box;border-radius:8px;border:2px solid #ffa500;font-size:14px;';
    surface.append(prompt, input); const started = Date.now(); let done = false;
    const end = () => {
        if (done) return; done = true; clearInterval(timer);
        const minutes = Math.max((Date.now() - started) / 60000, 1 / 60), words = input.value.trim() ? input.value.trim().split(/\s+/).length : 0;
        const accuracy = Math.round([...input.value].filter((letter, index) => letter === line[index]).length / line.length * 100);
        finish(surface, status, `${Math.round(words / minutes)} WPM · ${accuracy}% accuracy`, closeGame);
    };
    const timer = setInterval(() => { const seconds = Math.max(0, 60 - Math.floor((Date.now() - started) / 1000)); status.textContent = `${seconds}s remaining`; if (!seconds) end(); }, 250);
    activeCleanup = () => clearInterval(timer); input.oninput = () => { if (input.value === line) end(); }; input.focus();
}

function startReaction() {
    const { surface, status, closeGame } = openGame('Reaction Tap', 'Tap the smaller dot eight times as soon as it appears.');
    const field = document.createElement('div'); field.style.cssText = 'position:relative;width:285px;height:280px;border-radius:14px;border:1px solid #455;background:#172033;overflow:hidden;'; surface.append(field);
    const scores = []; let waiting;
    const next = () => {
        if (scores.length === 8) return finish(surface, status, `Average reaction time: ${Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)} ms`, closeGame);
        status.textContent = `Round ${scores.length + 1} of 8 — wait for it…`; field.replaceChildren();
        waiting = setTimeout(() => {
            const dot = makeButton(''); dot.setAttribute('aria-label', 'Tap the reaction dot'); dot.style.cssText = `position:absolute;left:${16 + Math.random() * 235}px;top:${16 + Math.random() * 235}px;width:34px;height:34px;border:0;border-radius:50%;background:#ffa500;box-shadow:0 0 16px rgba(255,165,0,.72);cursor:pointer;`;
            const shown = performance.now(); dot.onclick = () => { scores.push(Math.round(performance.now() - shown)); next(); }; field.append(dot); status.textContent = `Round ${scores.length + 1} of 8 — TAP!`;
        }, 400 + Math.random() * 1100);
    };
    activeCleanup = () => clearTimeout(waiting); next();
}

function startStroop() {
    const { surface, status, closeGame } = openGame('Color Match', 'Tap the ink color — not the word itself. Eight quick rounds.');
    let round = 0, score = 0;
    const render = () => {
        if (round === 8) return finish(surface, status, `${score} of 8 correct. Reset complete.`, closeGame);
        const ink = Math.floor(Math.random() * 4); let word = Math.floor(Math.random() * 4); if (word === ink) word = (word + 1) % 4;
        const display = document.createElement('div'); display.textContent = COLORS[word].name; display.style.cssText = `font-size:42px;font-weight:900;letter-spacing:3px;color:${COLORS[ink].value};margin-bottom:24px;`;
        const options = document.createElement('div'); options.style.cssText = 'display:grid;grid-template-columns:repeat(2,118px);gap:10px;';
        COLORS.forEach((color, index) => { const pick = makeButton(color.name); pick.style.cssText = `padding:13px 4px;border:0;border-radius:8px;background:${color.value};color:${color.name === 'YELLOW' ? '#2b2100' : '#fff'};font-weight:800;cursor:pointer;`; pick.onclick = () => { if (index === ink) score++; round++; status.textContent = index === ink ? 'Correct.' : 'Close — follow the ink color.'; render(); }; options.append(pick); });
        surface.replaceChildren(display, options); status.textContent = `Round ${round + 1} of 8`;
    };
    render();
}

function startPattern() {
    const { surface, status, closeGame } = openGame('Pattern Memory Flash', 'Watch one short sequence, then repeat it once.');
    const sequence = Array.from({ length: 5 }, () => Math.floor(Math.random() * 4)); let entered = [], ready = false, timeout;
    const tiles = document.createElement('div'); tiles.style.cssText = 'display:grid;grid-template-columns:repeat(2,104px);gap:12px;';
    const buttons = COLORS.map((color, index) => {
        const tile = makeButton(''); tile.disabled = true; tile.style.cssText = `width:104px;height:104px;border:0;border-radius:14px;background:${color.value};opacity:.36;cursor:pointer;transition:opacity .12s,transform .12s;`;
        tile.onclick = () => { if (!ready) return; entered.push(index); const place = entered.length - 1; if (entered[place] !== sequence[place]) return finish(surface, status, 'Almost — the pattern is complete for this round.', closeGame); if (entered.length === sequence.length) return finish(surface, status, 'Pattern complete. Your attention is warmed up.', closeGame); status.textContent = `${entered.length} of ${sequence.length} correct.`; };
        tiles.append(tile); return tile;
    });
    surface.append(tiles); status.textContent = 'Watch closely…'; let step = 0;
    const flash = () => {
        if (step === sequence.length) { ready = true; buttons.forEach(tile => tile.disabled = false); status.textContent = 'Your turn — repeat the sequence.'; return; }
        const tile = buttons[sequence[step]]; tile.style.opacity = '1'; tile.style.transform = 'scale(1.06)';
        timeout = setTimeout(() => { tile.style.opacity = '.36'; tile.style.transform = ''; step++; timeout = setTimeout(flash, 180); }, 520);
    };
    activeCleanup = () => clearTimeout(timeout); timeout = setTimeout(flash, 650);
}

export function initAICoach() {
    document.getElementById('mazeGameBtn').onclick = startMaze;
    document.getElementById('typingGameBtn').onclick = startTyping;
    document.getElementById('reactionGameBtn').onclick = startReaction;
    document.getElementById('stroopGameBtn').onclick = startStroop;
    document.getElementById('patternGameBtn').onclick = startPattern;
}
