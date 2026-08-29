(() => {
  'use strict';

  // Theme-gradient mapping. Add a new theme by adding its storage value here.
  const THEMES = {
    dark: { background: 'linear-gradient(132deg, #030303, #c89019, #15533b, #123d73, #6d244b, #bd452c, #e9dfc7)', glow: 'none', text: '#f5f2ea', muted: 'rgba(245,242,234,.62)', glass: 'rgba(255,255,255,.1)', line: 'rgba(255,255,255,.14)', accent: '#d7ad4a' },
    onyx: { background: 'linear-gradient(132deg, #030303, #c89019, #15533b, #123d73, #6d244b, #bd452c, #e9dfc7)', glow: 'none', text: '#f5f2ea', muted: 'rgba(245,242,234,.62)', glass: 'rgba(255,255,255,.1)', line: 'rgba(255,255,255,.14)', accent: '#d7ad4a' },
    light: { background: 'linear-gradient(132deg, #fbf5e6, #dca541, #8ba881, #8faec4, #c795aa, #d7997a, #fffdf6)', glow: 'none', text: '#28241e', muted: 'rgba(40,36,30,.62)', glass: 'rgba(55,45,32,.07)', line: 'rgba(40,36,30,.13)', accent: '#785d2b' },
    forest: { background: 'linear-gradient(132deg, #06100a, #d29c38, #1d744d, #194a52, #385d2e, #a95b2d, #e4d3a6)', glow: 'none', text: '#eff6ed', muted: 'rgba(239,246,237,.62)', glass: 'rgba(255,255,255,.09)', line: 'rgba(255,255,255,.14)', accent: '#d5a74b' },
    paper: { background: 'linear-gradient(132deg, #faf2df, #d4a64b, #93ad91, #91b4c3, #c49aaa, #d49277, #fffaf0)', glow: 'none', text: '#28241e', muted: 'rgba(40,36,30,.62)', glass: 'rgba(55,45,32,.07)', line: 'rgba(40,36,30,.13)', accent: '#785d2b' },
    circuit: { background: 'linear-gradient(132deg, #04101d, #55d7b0, #176f85, #3459bd, #783c9b, #d65754, #c4f4dc)', glow: 'none', text: '#ecfbff', muted: 'rgba(236,251,255,.62)', glass: 'rgba(255,255,255,.09)', line: 'rgba(142,240,255,.16)', accent: '#70f0c1' },
    dopamine: { background: 'linear-gradient(132deg, #050505, #787878, #202020, #9b9b9b, #323232, #cacaca, #0b0b0b)', glow: 'none', text: '#f4f4f4', muted: 'rgba(244,244,244,.62)', glass: 'rgba(255,255,255,.09)', line: 'rgba(255,255,255,.13)', accent: '#fff' }
  };
  // Friendly aliases support descriptive theme values if/when the settings UI adds them.
  THEMES['onyx & gold'] = THEMES.onyx;
  THEMES['forest focus'] = THEMES.forest;
  THEMES['paper & ink'] = THEMES.paper;
  THEMES['dopamine minimal'] = THEMES.dopamine;
  const $ = id => document.getElementById(id);
  let homepageSessionActive = false;
  let checklistItems = [];
  const todayKey = () => new Date().toLocaleDateString('en-CA');
  // Aliases are search terms only; selections always persist the IANA name.
  const WORLD_TIMEZONES = [
    { zone: 'America/New_York', city: 'New York, USA', aliases: ['EST', 'EDT'], description: 'Eastern Time (New York, USA)' },
    { zone: 'America/Chicago', city: 'Chicago, USA', aliases: ['CST-US', 'CDT'], description: 'US Central Time (Chicago, USA)' },
    { zone: 'America/Denver', city: 'Denver, USA', aliases: ['MST', 'MDT'] },
    { zone: 'America/Los_Angeles', city: 'Los Angeles, USA', aliases: ['PST', 'PDT'] },
    { zone: 'Etc/UTC', city: 'UTC', aliases: ['GMT', 'UTC'] },
    { zone: 'Europe/London', city: 'London, United Kingdom', aliases: ['BST', 'GMT'] },
    { zone: 'Europe/Paris', city: 'Paris, France', aliases: ['CET', 'CEST'] },
    { zone: 'Asia/Kolkata', city: 'Kolkata, India', aliases: ['IST'], description: 'India Standard Time (Kolkata)' },
    { zone: 'Europe/Dublin', city: 'Dublin, Ireland', aliases: ['IST'], description: 'Irish Standard Time (Dublin)' },
    { zone: 'Asia/Jerusalem', city: 'Jerusalem, Israel', aliases: ['IST'], description: 'Israel Standard Time (Jerusalem)' },
    { zone: 'Asia/Tokyo', city: 'Tokyo, Japan', aliases: ['JST'] },
    { zone: 'Australia/Sydney', city: 'Sydney, Australia', aliases: ['AEST', 'AEDT'] },
    { zone: 'Asia/Singapore', city: 'Singapore', aliases: ['SGT'] },
    { zone: 'Asia/Seoul', city: 'Seoul, South Korea', aliases: ['KST'] },
    { zone: 'Asia/Hong_Kong', city: 'Hong Kong', aliases: ['HKT'] },
    { zone: 'Asia/Shanghai', city: 'Shanghai, China', aliases: ['CST-China'] },
    { zone: 'America/Havana', city: 'Havana, Cuba', aliases: ['CST'] }
  ];
  const TIMEZONE_OVERRIDES = [
    { zone: 'America/New_York', city: 'New York, USA', country: 'USA', extra: ['Washington DC', 'Boston', 'Miami', 'Atlanta'], aliases: ['EST', 'EDT'], description: 'Eastern Time (New York, USA)' },
    { zone: 'America/Chicago', city: 'Chicago, USA', country: 'USA', extra: ['Houston', 'Dallas', 'Austin'], aliases: ['CST', 'CST-US', 'CDT'], description: 'US Central Time (Chicago, USA)' },
    { zone: 'America/Denver', city: 'Denver, USA', country: 'USA', aliases: ['MST', 'MDT'], description: 'Mountain Time (Denver, USA)' },
    { zone: 'America/Phoenix', city: 'Phoenix, USA', country: 'USA', aliases: ['MST'], description: 'Mountain Standard Time (Phoenix, USA)' },
    { zone: 'America/Los_Angeles', city: 'Los Angeles, USA', country: 'USA', extra: ['Seattle', 'Portland'], aliases: ['PST', 'PDT'], description: 'Pacific Time (Los Angeles, USA)' },
    { zone: 'America/Anchorage', city: 'Anchorage, USA', country: 'USA', aliases: ['AKST', 'AKDT'] },
    { zone: 'Pacific/Honolulu', city: 'Honolulu, USA', country: 'USA', aliases: ['HST'] },
    { zone: 'America/Toronto', city: 'Toronto, Canada', country: 'Canada', extra: ['Montreal'], aliases: ['EST', 'EDT'] },
    { zone: 'America/Vancouver', city: 'Vancouver, Canada', country: 'Canada', aliases: ['PST', 'PDT'] },
    { zone: 'America/Winnipeg', city: 'Winnipeg, Canada', country: 'Canada', aliases: ['CST', 'CDT'] },
    { zone: 'America/Edmonton', city: 'Edmonton, Canada', country: 'Canada', aliases: ['MST', 'MDT'] },
    { zone: 'America/Halifax', city: 'Halifax, Canada', country: 'Canada', aliases: ['AST', 'ADT'] },
    { zone: 'America/St_Johns', city: "St. John's, Canada", country: 'Canada', aliases: ['NST', 'NDT'] },
    { zone: 'America/Mexico_City', city: 'Mexico City, Mexico', country: 'Mexico', aliases: ['CST', 'CDT'] },
    { zone: 'America/Cancun', city: 'Cancun, Mexico', country: 'Mexico' },
    { zone: 'America/Tijuana', city: 'Tijuana, Mexico', country: 'Mexico' },
    { zone: 'Australia/Sydney', city: 'Sydney, Australia', country: 'Australia', aliases: ['AEST', 'AEDT'] },
    { zone: 'Australia/Adelaide', city: 'Adelaide, Australia', country: 'Australia', aliases: ['ACST', 'ACDT'] },
    { zone: 'Australia/Perth', city: 'Perth, Australia', country: 'Australia', aliases: ['AWST'] },
    { zone: 'Australia/Darwin', city: 'Darwin, Australia', country: 'Australia', aliases: ['ACST'] },
    { zone: 'America/Sao_Paulo', city: 'São Paulo, Brazil', country: 'Brazil' },
    { zone: 'America/Manaus', city: 'Manaus, Brazil', country: 'Brazil' },
    { zone: 'America/Rio_Branco', city: 'Rio Branco, Brazil', country: 'Brazil' },
    { zone: 'Asia/Jakarta', city: 'Jakarta, Indonesia', country: 'Indonesia', aliases: ['WIB'] },
    { zone: 'Asia/Makassar', city: 'Makassar, Indonesia', country: 'Indonesia', aliases: ['WITA'] },
    { zone: 'Asia/Jayapura', city: 'Jayapura, Indonesia', country: 'Indonesia', aliases: ['WIT'] },
    { zone: 'Europe/Moscow', city: 'Moscow, Russia', country: 'Russia' }, { zone: 'Europe/Samara', city: 'Samara, Russia', country: 'Russia' },
    { zone: 'Asia/Yekaterinburg', city: 'Yekaterinburg, Russia', country: 'Russia' }, { zone: 'Asia/Omsk', city: 'Omsk, Russia', country: 'Russia' },
    { zone: 'Asia/Novosibirsk', city: 'Novosibirsk, Russia', country: 'Russia' }, { zone: 'Asia/Krasnoyarsk', city: 'Krasnoyarsk, Russia', country: 'Russia' },
    { zone: 'Asia/Irkutsk', city: 'Irkutsk, Russia', country: 'Russia' }, { zone: 'Asia/Yakutsk', city: 'Yakutsk, Russia', country: 'Russia' },
    { zone: 'Asia/Vladivostok', city: 'Vladivostok, Russia', country: 'Russia' }, { zone: 'Asia/Magadan', city: 'Magadan, Russia', country: 'Russia' },
    { zone: 'Asia/Kamchatka', city: 'Kamchatka, Russia', country: 'Russia' }
  ];
  const supportedTimezones = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : WORLD_TIMEZONES.map(item => item.zone);
  const genericTimezone = zone => ({ zone, city: zone.split('/').at(-1).replaceAll('_', ' '), country: zone.split('/')[0], aliases: [], extra: [] });
  const timezoneCatalog = [...new Map([...supportedTimezones.map(genericTimezone), ...WORLD_TIMEZONES, ...TIMEZONE_OVERRIDES].map(item => [item.zone, { ...genericTimezone(item.zone), ...item }])).values()];
  const timezoneByIana = zone => timezoneCatalog.find(item => item.zone === zone) || timezoneCatalog.find(item => item.zone === 'America/New_York');

  // MV3 blocks eval/Function, so calculator expressions are evaluated locally
  // with a small precedence-aware parser instead.
  function calculateExpression(expression) {
    const source = expression.replace(/\s+/g, '');
    const tokens = source.match(/\d*\.?\d+|[()+\-*/]/g);
    if (!tokens || tokens.join('') !== source) throw new Error('Invalid expression');
    const values = [], operators = [];
    const precedence = operator => (operator === '+' || operator === '-') ? 1 : 2;
    const apply = () => {
      const operator = operators.pop(), right = values.pop(), left = values.pop();
      if (!Number.isFinite(left) || !Number.isFinite(right)) throw new Error('Invalid expression');
      const result = operator === '+' ? left + right : operator === '-' ? left - right : operator === '*' ? left * right : left / right;
      if (!Number.isFinite(result)) throw new Error('Invalid result');
      values.push(result);
    };
    let expectsValue = true;
    for (const token of tokens) {
      if (/^\d/.test(token)) {
        if (!expectsValue) throw new Error('Missing operator');
        values.push(Number(token)); expectsValue = false;
      } else if (token === '(') {
        if (!expectsValue) throw new Error('Missing operator');
        operators.push(token);
      } else if (token === ')') {
        if (expectsValue) throw new Error('Missing value');
        while (operators.length && operators.at(-1) !== '(') apply();
        if (operators.pop() !== '(') throw new Error('Unbalanced brackets');
      } else {
        if (expectsValue) throw new Error('Missing value');
        while (operators.length && operators.at(-1) !== '(' && precedence(operators.at(-1)) >= precedence(token)) apply();
        operators.push(token); expectsValue = true;
      }
    }
    if (expectsValue) throw new Error('Missing value');
    while (operators.length) { if (operators.at(-1) === '(') throw new Error('Unbalanced brackets'); apply(); }
    if (values.length !== 1) throw new Error('Invalid expression');
    return values[0];
  }

  async function copyImageDirectly(dataUrl) {
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
  }

  function applyTheme(theme) {
    // The New Tab page now owns its appearance with newtabAppearance.
  }

  function applyAppearance(mode = 'night') {
    const dayMode = mode === 'day';
    document.body.classList.toggle('day-mode', dayMode);
    const toggle = $('appearance-toggle');
    toggle.textContent = dayMode ? '☾' : '☼';
    toggle.setAttribute('aria-pressed', String(dayMode));
    toggle.setAttribute('aria-label', `Switch to ${dayMode ? 'night' : 'day'} mode`);
  }

  function applyHomepageBackground(dataUrl) {
    const scene = $('rainbow-scene');
    const hasBackground = Boolean(dataUrl);
    scene.classList.toggle('has-custom-background', hasBackground);
    if (hasBackground) document.documentElement.style.setProperty('--homepage-background-image', `url("${dataUrl}")`);
    else document.documentElement.style.removeProperty('--homepage-background-image');
  }

  function updateClock() {
    const now = new Date();
    const formatTime = timeZone => new Intl.DateTimeFormat(undefined, {
      hour: 'numeric', minute: '2-digit', hour12: true, ...(timeZone ? { timeZone } : {})
    }).format(now);
    $('clock').dateTime = now.toISOString();
    $('clock').textContent = formatTime();
    $('left-clock').dateTime = now.toISOString();
    const leftZone = $('left-timezone').dataset.timeZone;
    $('left-clock').hidden = !leftZone;
    if (leftZone) $('left-clock').textContent = formatTime(leftZone);
    $('right-clock').dateTime = now.toISOString();
    const rightZone = $('right-timezone').dataset.timeZone;
    $('right-clock').hidden = !rightZone;
    if (rightZone) $('right-clock').textContent = formatTime(rightZone);
  }

  function greetingPrefix() {
    const hour = new Date().getHours();
    return `Good ${hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'}`;
  }

  function renderGreeting(name) {
    const heading = $('greeting');
    heading.replaceChildren(document.createTextNode(`${greetingPrefix()}, `));
    const nameButton = document.createElement('button');
    nameButton.type = 'button';
    nameButton.className = name ? 'name-action greeting-name' : 'name-action name-placeholder';
    // An empty, underlined name slot reads as part of the greeting instead of
    // introducing a large secondary instruction into the hero text.
    nameButton.textContent = name || '\u00a0';
    nameButton.setAttribute('aria-label', name ? 'Edit your name' : 'Add your name');
    nameButton.addEventListener('click', () => beginNameEdit(name));
    heading.appendChild(nameButton);

    if (name) {
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'name-action name-edit';
      editButton.textContent = '✎';
      editButton.setAttribute('aria-label', 'Edit your name');
      editButton.addEventListener('click', () => beginNameEdit(name));
      heading.appendChild(editButton);
    }
  }

  function beginNameEdit(currentName = '') {
    const heading = $('greeting');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'name-input';
    input.maxLength = 60;
    input.value = currentName;
    input.placeholder = 'Your name';
    input.setAttribute('aria-label', 'Your name');
    heading.replaceChildren(document.createTextNode(`${greetingPrefix()}, `), input);
    input.focus();
    input.select();
    let nameSaved = false;
    const saveName = () => {
      if (nameSaved) return;
      nameSaved = true;
      const name = input.value.trim();
      if (name) chrome.storage.local.set({ userName: name });
      renderGreeting(name);
    };
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') saveName();
      if (event.key === 'Escape') renderGreeting(currentName);
    });
    input.addEventListener('blur', saveName, { once: true });
  }

  function formatQuote(quote) {
    return `“${quote.text}”${quote.author ? ` — ${quote.author}` : ''}`;
  }

  function loadDailyQuote() {
    const quoteEl = $('focus-stat');
    const dayNumber = Math.floor(Date.now() / 86400000);
    quoteEl.textContent = formatQuote({ text: DAILY_QUOTES[dayNumber % DAILY_QUOTES.length] });
  }

  function drawerSummary(history = {}) {
    let total = 0;
    for (let offset = 0; offset < 7; offset++) {
      const day = new Date();
      day.setDate(day.getDate() - offset);
      total += history[day.toLocaleDateString('en-CA')] || 0;
    }
    return `${total} focused minutes in the last 7 days`;
  }

  function blueprintForToday() {
    const snippets = [
      'Protect the next small block of attention.', 'A clear next step is enough for today.',
      'Consistency is quieter and stronger than urgency.', 'Make the work easy to begin.',
      'Return gently; focus is a practice, not a verdict.', 'Do one meaningful thing before the noise begins.',
      'Attention is your most valuable resource—spend it deliberately.'
    ];
    return snippets[new Date().getDay()];
  }

  function saveGoal() {
    const value = $('goal-input').value.trim();
    chrome.storage.local.set({ todaysGoal: value, todaysGoalTimestamp: Date.now(), todaysGoalDate: todayKey() });
  }

  function updateStartFocusButton() {
    const hasGoal = Boolean($('goal-input').value.trim());
    const button = $('start-focus-session');
    const showSessionControl = hasGoal || homepageSessionActive;
    button.classList.toggle('is-visible', showSessionControl);
    button.classList.toggle('is-ending', homepageSessionActive);
    button.disabled = !showSessionControl;
    button.title = homepageSessionActive ? 'End focus session' : 'Start focus session';
    button.setAttribute('aria-label', homepageSessionActive ? 'End focus session' : 'Start focus session');
    $('pomodoro-presets').classList.toggle('is-visible', showSessionControl);
  }

  function updatePomodoroPresets(timer = {}) {
    const active = timer.pomoActive === true;
    const duration = Number(timer.workDuration);
    document.querySelectorAll('.pomo-preset').forEach(button => {
      const selected = active && Number(button.dataset.minutes) === duration;
      button.classList.toggle('is-active', selected);
      button.disabled = active && !selected;
      button.setAttribute('aria-pressed', String(selected));
    });
    $('pomodoro-presets').classList.toggle('has-active-timer', active);
  }

  function persistChecklist() {
    chrome.storage.local.set({ homepageChecklist: checklistItems });
  }

  function renderChecklist() {
    const rows = $('checklist-rows');
    rows.replaceChildren();
    checklistItems.forEach(item => {
      const row = document.createElement('div');
      row.className = `checklist-row${item.completed ? ' is-complete' : ''}`;
      const toggle = document.createElement('button');
      toggle.type = 'button'; toggle.className = 'checklist-toggle';
      toggle.setAttribute('role', 'checkbox'); toggle.setAttribute('aria-checked', String(Boolean(item.completed)));
      toggle.setAttribute('aria-label', `${item.completed ? 'Mark incomplete' : 'Mark complete'}: ${item.text}`);
      toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
      toggle.addEventListener('click', () => { item.completed = !item.completed; persistChecklist(); renderChecklist(); });
      const text = document.createElement('span');
      text.className = 'checklist-text'; text.textContent = item.text;
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'checklist-delete'; remove.title = 'Delete task';
      remove.setAttribute('aria-label', `Delete task: ${item.text}`);
      remove.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/></svg>';
      remove.addEventListener('click', () => { checklistItems = checklistItems.filter(task => task.id !== item.id); persistChecklist(); renderChecklist(); });
      row.append(toggle, text, remove); rows.append(row);
    });
    const atLimit = checklistItems.length >= 6;
    $('checklist-add-input').disabled = atLimit;
    $('checklist-add-button').disabled = atLimit;
    $('checklist-add-input').placeholder = atLimit ? 'Checklist is full' : 'Add a stickpost';
  }

  function addChecklistItem(event) {
    event.preventDefault();
    const input = $('checklist-add-input');
    const text = input.value.trim();
    if (!text || checklistItems.length >= 6) return;
    checklistItems.push({ id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`, text: text.slice(0, 40), completed: false });
    input.value = ''; persistChecklist(); renderChecklist(); input.focus();
  }

  function startPresetPomodoro(event) {
    const minutes = Number(event.currentTarget.dataset.minutes);
    if (!Number.isFinite(minutes) || event.currentTarget.classList.contains('is-active')) return;

    // A typed homepage intention should not require a second click before its
    // timer can bring the focus widget onto open pages.
    chrome.storage.local.get('sessionActive', ({ sessionActive }) => {
      if (!sessionActive && $('goal-input').value.trim()) startFocusSession();
    });
    chrome.runtime.sendMessage({ action: 'startPomo', minutes });
    updatePomodoroPresets({ pomoActive: true, workDuration: minutes });
    $('focus-stat').textContent = `${minutes}-minute Pomodoro started.`;
  }

  function startFocusSession() {
    const goal = $('goal-input').value.trim();
    if (!goal) {
      $('goal-input').focus();
      return;
    }

    const now = Date.now();
    chrome.storage.local.set({
      userGoal: goal,
      sessionActive: true,
      subTasks: [],
      todaysGoal: goal,
      todaysGoalTimestamp: now,
      todaysGoalDate: todayKey()
    }, () => {
      homepageSessionActive = true;
      updateStartFocusButton();
      $('buddy-status').textContent = `Buddy is supporting: ${goal}`;
      $('focus-stat').textContent = 'Focus session started. Your focus widget is ready on your open pages.';
    });
  }

  function endFocusSession() {
    chrome.storage.local.remove([
      'userGoal', 'sessionActive', 'subTasks', 'pomoActive', 'pomoEndTime',
      'workDuration', 'currentStartTime', 'milestonesReached', 'pomoMilestones',
      'todaysGoal', 'todaysGoalTimestamp', 'todaysGoalDate'
    ], () => {
      chrome.alarms.clearAll();
      chrome.runtime.sendMessage({ action: 'broadcastEndSession' });
      homepageSessionActive = false;
      $('goal-input').value = '';
      updateStartFocusButton();
      updatePomodoroPresets({ pomoActive: false });
      $('buddy-status').textContent = 'Buddy is ready when you begin a focus session.';
      $('focus-stat').textContent = 'Focus session ended.';
      $('goal-input').focus();
    });
  }

  function handleFocusSessionButton() {
    if (homepageSessionActive) endFocusSession();
    else startFocusSession();
  }

  function setupTimezonePicker(side, storedZone, fallbackZone) {
    const input = $(`${side}-timezone`);
    const results = $(`${side}-timezone-results`);
    const selectZone = zone => {
      const item = zone ? timezoneByIana(zone) : null;
      input.dataset.timeZone = item?.zone || '';
      input.value = item?.city || '';
      $(`${side}-clock`).hidden = !item;
      input.closest('.world-clock').classList.toggle('is-empty', !item);
      results.hidden = true;
      chrome.storage.local.get('worldClockCities', data => {
        const cities = Array.isArray(data.worldClockCities) ? data.worldClockCities.slice(0, 2) : [null, null];
        while (cities.length < 2) cities.push(null);
        cities[side === 'left' ? 0 : 1] = item?.zone || null;
        chrome.storage.local.set({ worldClockCities: cities });
      });
      updateClock();
    };
    const showMatches = () => {
      const query = input.value.trim().toLowerCase();
      const matches = timezoneCatalog.filter(item => !query || [item.city, item.zone, item.country, ...(item.aliases || []), ...(item.extra || [])].some(value => value.toLowerCase().includes(query))).slice(0, 60);
      results.replaceChildren();
      const clear = document.createElement('button');
      clear.type = 'button'; clear.className = 'timezone-clear'; clear.textContent = 'Clear this clock';
      clear.addEventListener('mousedown', event => { event.preventDefault(); selectZone(null); });
      results.append(clear);
      matches.forEach(item => {
        const abbreviationMatch = (item.aliases || []).find(alias => alias.toLowerCase().includes(query));
        const option = document.createElement('button');
        option.type = 'button';
        option.setAttribute('role', 'option');
        option.title = item.zone;
        const primary = document.createElement('span');
        primary.textContent = abbreviationMatch ? `${abbreviationMatch} — ${item.description || item.city}` : item.city;
        const detail = document.createElement('small');
        detail.textContent = `${item.zone} · ${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: item.zone, timeZoneName: 'short' }).format(new Date())}`;
        option.append(primary, detail);
        option.addEventListener('mousedown', event => { event.preventDefault(); selectZone(item.zone); });
        results.append(option);
      });
      results.hidden = !matches.length;
    };
    input.addEventListener('focus', () => { input.select(); showMatches(); });
    input.addEventListener('input', showMatches);
    input.addEventListener('blur', () => setTimeout(() => { results.hidden = true; input.value = input.dataset.timeZone ? timezoneByIana(input.dataset.timeZone).city : ''; }, 120));
    selectZone(storedZone || fallbackZone);
  }

  function initialise(data) {
    applyTheme(data.theme);
    applyAppearance(data.newtabAppearance || 'night');
    applyHomepageBackground(data.homepageBackground);
    renderGreeting(data.userName || '');
    const storedToday = data.todaysGoalDate === todayKey() ? data.todaysGoal : '';
    $('goal-input').value = storedToday || '';
    homepageSessionActive = data.sessionActive === true;
    updateStartFocusButton();
    updatePomodoroPresets(data);
    checklistItems = Array.isArray(data.homepageChecklist) ? data.homepageChecklist.slice(0, 6).filter(item => typeof item?.text === 'string' && item.text.trim()) : [];
    renderChecklist();
    setupTimezonePicker('left', data.worldClockCities?.[0] ?? data.leftWorldTimeZone, 'America/New_York');
    setupTimezonePicker('right', data.worldClockCities?.[1] ?? data.rightWorldTimeZone, 'Europe/London');
    $('buddy-status').textContent = data.sessionActive && data.userGoal ? `Buddy is supporting: ${data.userGoal}` : 'Buddy is ready when you begin a focus session.';
    $('week-summary').textContent = drawerSummary(data.history);
    $('blueprint').textContent = `Today’s Blueprint: ${blueprintForToday()}`;
    loadDailyQuote(data);
    loadTopSites();
    document.body.setAttribute('aria-busy', 'false');
    $('search-input').focus();
  }

  function loadTopSites() {
    const shortcuts = $('shortcuts');
    chrome.topSites.get(sites => {
      if (chrome.runtime.lastError || !sites?.length) { shortcuts.hidden = true; return; }
      shortcuts.replaceChildren();
      sites.slice(0, 8).forEach(site => {
        const hostname = new URL(site.url).hostname.replace(/^www\./, '');
        const link = document.createElement('a');
        link.href = site.url;
        link.title = site.title || site.url;
        link.setAttribute('aria-label', `Open ${site.title || site.url}`);
        // chrome://favicon2 is not loadable by extension pages. Use a local
        // letter tile rather than a blocked internal-resource request.
        link.classList.add('shortcut-fallback');
        link.dataset.initial = (site.title || new URL(site.url).hostname).trim().charAt(0).toUpperCase();
        link.style.setProperty('--site-hue', String([...hostname].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360));
        const label = document.createElement('span');
        label.textContent = hostname.length > 14 ? `${hostname.slice(0, 13)}…` : hostname;
        link.append(label); shortcuts.append(link);
      });
      shortcuts.hidden = !shortcuts.childElementCount;
    });
  }

  function renderMinimalNewTab() {
    document.title = 'New Tab';
    document.body.className = 'default-like-newtab';
    document.body.innerHTML = '<main class="default-like-shell"><form id="fallback-search-form" role="search"><input id="fallback-search-input" type="search" autocomplete="off" placeholder="Search the web" aria-label="Search the web"></form><nav id="shortcuts" class="shortcuts" aria-label="Most visited sites" hidden></nav></main>';
    document.getElementById('fallback-search-form').addEventListener('submit', event => {
      event.preventDefault();
      const query = document.getElementById('fallback-search-input').value.trim();
      if (query) window.location.assign(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    });
    loadTopSites();
    document.documentElement.classList.add('focusbridge-ready');
    document.body.style.opacity = '1';
    document.getElementById('fallback-search-input').focus();
  }

  function boot() {
    document.title = '';
    document.addEventListener('keydown', event => {
      const target = event.target;
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
      if (isTyping || event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === '/') {
        event.preventDefault();
        $('search-form').classList.add('is-searching');
        $('search-input').focus();
      } else if (event.key.toLowerCase() === 'd') {
        const nextMode = document.body.classList.contains('day-mode') ? 'night' : 'day';
        chrome.storage.local.set({ newtabAppearance: nextMode });
      }
    });
    $('search-form').addEventListener('submit', event => {
      event.preventDefault();
      const query = $('search-input').value.trim();
      if (query) window.location.assign(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    });
    $('quick-focus').addEventListener('click', () => $('goal-input').focus());
    $('focus-search').addEventListener('click', () => { const query = $('search-input').value.trim(); if (query) window.location.assign(`https://www.google.com/search?q=${encodeURIComponent(`${query} focus`)}`); });
    $('voice-search').addEventListener('click', () => {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) { $('search-input').placeholder = 'Voice search is not available in this browser'; return; }
      const recognition = new Recognition(); recognition.lang = navigator.language || 'en-US'; recognition.interimResults = false;
      recognition.onresult = event => { $('search-input').value = event.results[0][0].transcript; $('search-form').requestSubmit(); };
      recognition.onerror = () => { $('search-input').placeholder = 'Voice search could not start'; };
      recognition.start();
    });
    $('goal-input').addEventListener('change', saveGoal);
    $('goal-input').addEventListener('input', updateStartFocusButton);
    $('start-focus-session').addEventListener('click', handleFocusSessionButton);
    document.querySelectorAll('.pomo-preset').forEach(button => button.addEventListener('click', startPresetPomodoro));
    $('checklist-add-form').addEventListener('submit', addChecklistItem);
    $('goal-input').addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleFocusSessionButton();
      }
    });

    $('drawer-toggle').addEventListener('click', () => {
      const open = $('detail-drawer').classList.toggle('is-open');
      $('drawer-toggle').setAttribute('aria-expanded', String(open));
      $('detail-drawer').setAttribute('aria-hidden', String(!open));
    });
    $('appearance-toggle').addEventListener('click', () => {
      const nextMode = document.body.classList.contains('day-mode') ? 'night' : 'day';
      chrome.storage.local.set({ newtabAppearance: nextMode });
    });
    chrome.storage.onChanged.addListener(changes => {
      if (changes.theme) applyTheme(changes.theme.newValue);
      if (changes.newtabAppearance) applyAppearance(changes.newtabAppearance.newValue || 'night');
      if (changes.homepageBackground) applyHomepageBackground(changes.homepageBackground.newValue || '');
      if (changes.homepageChecklist) {
        checklistItems = Array.isArray(changes.homepageChecklist.newValue) ? changes.homepageChecklist.newValue.slice(0, 6) : [];
        renderChecklist();
      }
      if (changes.sessionActive) {
        homepageSessionActive = changes.sessionActive.newValue === true;
        if (!homepageSessionActive) $('goal-input').value = '';
        updateStartFocusButton();
      }
      if (changes.pomoActive || changes.workDuration) {
        chrome.storage.local.get(['pomoActive', 'workDuration'], updatePomodoroPresets);
      }
      if (changes.showHomepageShortcuts) $('shortcuts').hidden = !changes.showHomepageShortcuts.newValue;
      if (changes.userName) renderGreeting(changes.userName.newValue || '');
      if (changes.worldClockCities) {
        ['left', 'right'].forEach((side, index) => {
          const zone = changes.worldClockCities.newValue?.[index] || '';
          const item = zone ? timezoneByIana(zone) : null;
          $(`${side}-timezone`).dataset.timeZone = item?.zone || '';
          $(`${side}-timezone`).value = item?.city || '';
          $(`${side}-clock`).hidden = !item;
          $(`${side}-timezone`).closest('.world-clock').classList.toggle('is-empty', !item);
        });
        updateClock();
      }
    });

    updateClock();
    setInterval(updateClock, 1000);
    chrome.storage.local.get(['theme', 'newtabAppearance', 'homepageBackground', 'homepageChecklist', 'userName', 'name', 'todaysGoal', 'todaysGoalDate', 'history', 'sessionActive', 'userGoal', 'pomoActive', 'workDuration', 'showHomepageShortcuts', 'worldClockCities', 'leftWorldTimeZone', 'rightWorldTimeZone'], data => {
      initialise(data);
      document.documentElement.classList.add('focusbridge-ready');
    });
  }

  // Startup happens after all const/function dependencies are initialized.
  // The native Chrome NTP cannot be restored by an installed override, but an
  // external Google page is a normal, permitted navigation target.
  chrome.storage.local.get('useFocusBridgeHomepage', ({ useFocusBridgeHomepage }) => {
    if (useFocusBridgeHomepage !== true) window.location.replace('https://www.google.com/');
    else boot();
  });
})();
