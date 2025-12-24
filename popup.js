/** 
 * POPUP.JS - FOCUSBRIDGE AI MASTER (Data-Synced Version)
 */
let dailyChart = null;
let weeklyChart = null;


const disciplineStories = [
  "<strong>Kobe Bryant:</strong> He began his legendary 4 AM workouts in high school, often practicing in the dark before janitors arrived. Even as a multi-millionaire superstar, he never missed a session, outworking every opponent before the sun rose. He famously said that while others were sleeping, he was getting a two-hour head start on his dreams. This relentless discipline proved that talent is only the floor; consistent work is the ceiling.",
  "<strong>Marie Curie:</strong> She spent four grueling years in a drafty, leaky shed, physically stirring heavy iron pots of boiling pitchblende. She worked through freezing winters and scorching summers, refusing to let poverty or physical exhaustion stop her research. Her hands were often scarred and her body weary, yet she never missed a day of data collection. This iron-willed discipline led to the discovery of radium and two Nobel Prizes.",
  "<strong>Ernest Hemingway:</strong> He wrote 500 words every single day, standing up, starting at the first light of sunrise. He believed that the discipline of daily output was the only way to squeeze the 'juice' out of a story before the day's distractions took over. Even on his worst days, he forced himself to produce, knowing that momentum is the writer's greatest tool. He proved that genius is often just the result of showing up when you’d rather stay in bed.",
  "<strong>Michael Jordan:</strong> After being cut from his high school varsity team, he didn't complain; he went to the gym at 6 AM every morning to practice. He used the sting of that rejection to build a discipline so fierce that he eventually became the greatest to ever play the game. Throughout his career, he famously 'practiced like it was a game,' never allowing himself a moment of laziness. His six championships were won in those early morning hours, long before the crowds started cheering.",
  "<strong>Isaac Newton:</strong> During the Great Plague of London, Newton was forced into 18 months of isolation at his family farm. While the world was in chaos, he disciplined his mind to work in absolute solitude on the laws of motion and gravity. He viewed this quiet time not as a prison, but as a laboratory for deep, uninterrupted thought. By the time he returned to society, he had laid the foundations for modern physics and calculus. It shows that what you do in private defines who you become in public.",
  "<strong>Maya Angelou:</strong> She kept a strict professional ritual of renting a tiny, anonymous hotel room to write in from 6:30 AM to 2 PM daily. She removed all personal items, photos, and distractions to ensure her creative voice remained pure and disciplined. She treated writing as a 'job' that required physical presence and mental order, regardless of her mood. This focused environment allowed her to transform her life's struggles into some of the most powerful literature in history.",
  "<strong>Benjamin Franklin:</strong> At age 20, he created a '13 Virtues' chart, tracking his failures in discipline every single day. He focused on one virtue per week, marking his progress with a lead pencil to hold himself accountable to his own standards. He believed that moral and professional perfection was a result of small, daily corrections over a lifetime. This constant self-reflection turned a humble printer's son into one of the most respected scientists and statesmen in the world.",
  "<strong>Serena Williams:</strong> At just three years old, she was on the public courts of Compton at 6 AM, hitting balls until her father was satisfied. Decades later, that same morning discipline made her the most dominant force in women’s tennis history. She trained through injuries and setbacks, never allowing her focus to waver from the next point. Her career proves that greatness isn't born in a moment of glory, but earned in years of unseen, disciplined repetition.",
  "<strong>Stephen King:</strong> He writes 2,000 words every single day, including his birthday and holidays, without exception. He views his creative mind as a 'working muscle' that must be exercised daily to stay sharp and productive. By sitting at his desk at the same time every morning, he trains his subconscious to be ready for work. He views discipline as the 'iron pipe' that allows the 'water' of inspiration to flow consistently. If he waited for 'the mood' to strike, he would have never become a master of his craft.",
  "<strong>Elon Musk:</strong> In the early days of Zip2, he couldn't afford an apartment, so he lived in his office and showered at the local YMCA. He worked through the night, slept on a beanbag, and was back at his computer as soon as he woke up. His discipline to work 100-hour weeks saved his companies from total bankruptcy multiple times. He believes that the sheer volume of work you put in is the ultimate competitive advantage. While others work 40 hours, his discipline allows him to accomplish three times as much in the same year.",
  "<strong>Marcus Aurelius:</strong> Despite being the most powerful man in the world as Emperor of Rome, he woke up early every day to write in his journal. He used these private moments to discipline his mind against the temptations of power and the stress of war. He wrote for himself, practicing Stoic logic to ensure he remained a servant to his principles rather than his ego. His 'Meditations' were never meant for publication, yet they remain a manual for disciplined living nearly 2,000 years later.",
  "<strong>Leonardo da Vinci:</strong> He carried a silverpoint notebook attached to his belt at all times to sketch and record observations immediately. His discipline in constant observation meant he never let a single spark of curiosity or an anatomical detail go unrecorded. He would spend weeks studying the flight of birds or the flow of water to understand the underlying mechanics of nature. This obsessive discipline in research turned his paintings into masterpieces of scientific accuracy. He proved that a disciplined eye sees what everyone else overlooks.",
  "<strong>Muhammad Ali:</strong> He famously hated every single minute of his training, but he used a powerful mantra to keep himself going. He would tell himself: 'Don't quit. Suffer now and live the rest of your life as a champion.' He disciplined his body to endure pain so that his mind would be unbeatable in the ring. Every mile he ran and every punch he threw in the gym was a deposit into his future victory. For Ali, discipline was the high price he was willing to pay for legendary glory.",
  "<strong>J.K. Rowling:</strong> As a struggling single mother, Rowling had no office and very little quiet time to herself. She spent every minute of her daughter's nap time in local cafes, writing the first Harry Potter book by hand because she couldn't afford a computer. Even after being rejected by twelve different publishers, she disciplined herself to keep sending her manuscript out until someone said yes. She didn't wait for 'free time'; she used her discipline to create it. Her story proves that your current situation is never an excuse to stop your work.",
  "<strong>Thomas Edison:</strong> He tried 1,000 different materials for the lightbulb filament, failing with every single one of them. When asked about his failures, he replied that he hadn't failed, but had simply found 1,000 ways that didn't work. His discipline wasn't just in the invention itself, but in the relentless refusal to let the 999 failures stop his progress. He maintained a strict 18-hour workday well into his seventies, fueled by a disciplined curiosity. Success, he claimed, was 1% inspiration and 99% perspiration.",
  "<strong>Arnold Schwarzenegger:</strong> During his early years in America, he worked a full-time construction job, attended business school, and trained in the gym for five hours a day. He would wake up at 5 AM to fit everything in, never allowing a single hour to be wasted on excuses. He disciplined his mind to see the 'vision' of his future so clearly that the hard work became a joy. He proved that discipline can expand the hours in a day if your goals are big enough. Today, he credits his entire multi-industry success to that early foundation of iron discipline.",
  "<strong>Albert Einstein:</strong> He lived a famously simple life, wearing the same gray suit every day to avoid 'decision fatigue.' He realized that every small choice took away a piece of mental energy he needed for physics. By disciplining his daily routine into a predictable pattern, he saved his entire mental capacity for the complex math of the universe. He would sit for hours in silence, visualizing light beams until he solved the mysteries of space and time. His genius was not just in his brain, but in his discipline to protect his mental energy.",
  "<strong>Charles Darwin:</strong> He followed a rigid daily schedule, walking the same 'Sandwalk' path behind his house every morning to think. He counted his laps by moving stones from one pile to another, ensuring his mind was focused on his theory of evolution. He spent twenty years quietly gathering evidence and disciplining himself to answer every possible objection before publishing his work. This patient, methodical routine was the quiet engine behind 'The Origin of Species.' He showed that world-changing ideas are built through decades of steady, disciplined accumulation.",
  "<strong>Simone Biles:</strong> She practices the same landing thousands of times in a row until it becomes subconscious muscle memory. Her discipline in the gym is so extreme that she can perform maneuvers that other gymnasts find physically impossible. She views every repetition as a way to conquer the fear of the height and the speed of her vault. This intense discipline allows her to find total freedom and creativity when she is in the air. She proves that mastery is the ability to do the hard work so well that it looks easy.",
  "<strong>Abraham Lincoln:</strong> He walked miles to borrow books and read by the flickering firelight after working all day in the fields. Without a formal education, he disciplined himself to master the law and the art of public speaking through pure self-study. He would write and rewrite his speeches until every word was precise and powerful. This lifelong discipline in self-improvement led him from a one-room log cabin to the presidency. He showed that a disciplined mind can overcome any social or economic barrier.",
  "<strong>Ada Lovelace:</strong> Despite being a high-society socialite, she spent hours every day studying what she called 'the poetry of mathematics.' She disciplined herself to understand the mechanics of early calculating engines, seeing a future that no one else could imagine. Her notes on the Analytical Engine contained the world's first complex algorithm, making her the first computer programmer. She had to fight against the expectations of her era to pursue her disciplined study of numbers. Her work laid the foundation for the digital world we live in today.",
  "<strong>Warren Buffett:</strong> He spends 80% of his working day doing nothing but reading and thinking in a quiet room. His discipline isn't in making 'fast trades,' but in the quiet, daily accumulation of knowledge over seven decades. He refuses to follow market trends, sticking instead to a disciplined set of rules he developed as a young man. He understands that in a world of noise, the person who can sit still and read the most wins. His multi-billion dollar fortune is the 'compound interest' of 70 years of disciplined study.",
  "<strong>Michelangelo:</strong> He spent four years on a cramped scaffold painting the Sistine Chapel ceiling, often sleeping in his boots to save time. The physical discipline required to paint while looking upward resulted in permanent damage to his neck and eyesight. Yet, he refused to let any assistant finish the work, believing that his discipline for perfection was a sacred duty. He turned stone into muscle and plaster into divinity through sheer, painful endurance. He proved that a masterpiece is simply a vision that was too disciplined to quit.",
  "<strong>Katherine Johnson:</strong> She checked every complex orbital calculation for NASA by hand using only a pencil and a slide rule. Her discipline for absolute accuracy was so legendary that John Glenn refused to fly until 'the girl' had personally verified the computer's numbers. She worked in a segregated office, facing systemic barriers every day, yet she remained perfectly focused on the math of the stars. Her disciplined mind was the invisible force that eventually put a man on the moon. She showed that precision is the highest form of professional discipline.",
  "<strong>Cristiano Ronaldo:</strong> He is famously the first player to arrive at the training ground and the last one to leave every single day. His discipline extends to a precise diet, a strict sleep schedule, and extra recovery sessions that most players skip. Even after winning every possible trophy, he maintains the same hunger he had as a teenager in Madeira. He has transformed his body into a perfect machine through twenty years of relentless, daily choices. His longevity in the sport is the direct result of a discipline that never takes a day off.",
  "<strong>Nikola Tesla:</strong> He worked from 3 AM to 11 PM every single day, including Sundays and holidays, for most of his life. While his mind was full of wild, futuristic visions, his work schedule was a fortress of extreme and lonely discipline. He would perform every calculation in his head to perfect an invention before ever building a physical prototype. He believed that the discipline of mental visualization was faster and more accurate than trial and error. His work on alternating current and radio was the result of a life entirely sacrificed to disciplined discovery.",
  "<strong>Charles Dickens:</strong> He took a precise 12-mile walk every afternoon, rain or shine, to clear his head and observe the streets of London. This physical discipline was as important to his writing process as his time at the desk, providing the 'fuel' for his characters. He maintained a rigid production schedule, publishing his long novels in monthly installments without ever missing a deadline. He treated his imagination like a garden that needed daily, disciplined tending to stay fertile. His massive body of work was the result of a life lived in a perfect, productive rhythm.",
  "<strong>Steve Jobs:</strong> He spent months agonizing over the design of the circuit boards inside the original Mac, which no user would ever see. He believed that the discipline for 'hidden perfection' was what separated a great product from a merely good one. He was famous for his 'Focus'—the ability to say no to a thousand good ideas so he could say yes to one great one. He disciplined his companies to be minimalist, cutting away everything that wasn't essential to the user. His legacy proves that discipline is as much about what you delete as what you create.",
  "<strong>The Wright Brothers:</strong> They spent years in a bicycle shop, meticulously testing wind tunnels and wing shapes before ever attempting to fly. They moved to a remote, windy desert and lived in a shack for months, disciplining themselves to master the physics of the air. They faced public ridicule and hundreds of crashed gliders, yet they treated every crash as a data point for the next design. Their discipline in scientific testing turned a hobby into the birth of global aviation. They showed that the sky is not the limit for a disciplined mind.",
  "<strong>Malala Yousafzai:</strong> Even under the direct threat of violence, she disciplined herself to continue her studies and speak out for the right to learn. She treated her education as a weapon for change, reading and writing daily even when her school was closed. Her courage was fueled by the daily habit of learning and the discipline to never let fear silence her voice. She became the youngest Nobel Prize laureate by showing the world that a book and a pen are more powerful than any threat. Her life is a testament to the discipline of staying true to your purpose.",
  "<strong>Jeff Bezos:</strong> In the early years of Amazon, he used an old wooden door as a desk to save money for the company's growth. He disciplined himself and his staff to be 'obsessively frugal,' putting every penny into the customer experience rather than fancy offices. He maintained a long-term discipline, refusing to care about short-term profits for nearly twenty years. By staying focused on a vision two decades away, he built the most powerful retail engine in history. He proved that the discipline to stay 'Day 1' humble is the key to infinite growth."
];

function displayDailyStory() {
  const storyEl = document.getElementById('storyText');
  if (storyEl) {
    const dayOfMonth = new Date().getDate();
    const rawStory = disciplineStories[dayOfMonth - 1];

    // This logic finds the colon (:) and wraps everything before it in bold tags
    if (rawStory.includes(":")) {
      const parts = rawStory.split(":");
      const name = parts[0];
      const restOfStory = parts.slice(1).join(":"); // Handles cases with multiple colons
      
      storyEl.innerHTML = `<strong>${name}:</strong>${restOfStory}`;
    } else {
      storyEl.innerHTML = rawStory;
    }
  }
}

// Ensure this is called in your initialization block
displayDailyStory();

// Call this when popup opens
displayDailyStory();

// --- 1. NAVIGATION ---
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    item.classList.add('active');
    
    const tabId = item.dataset.tab;
    document.getElementById(tabId).classList.add('active');

    if (tabId === 'tab-stats') loadAllStats();
    if (tabId === 'tab-rules') { updateSmartSuggest(); renderRulesLedger(); }
    
    // ADD THIS LINE:
    if (tabId === 'tab-ai') loadAIReflection(); 
  });
});

// --- 2. STATS LOGIC (Source of Truth Fix) ---
async function loadAllStats() {
  const res = await chrome.storage.local.get(['history']);
  const history = res.history || {};
  const todayDate = new Date().toISOString().split('T')[0];
  
  // Use the history object for TODAY as the source for the wheel
  const todayMins = history[todayDate] || 0;
  
  const todayLabel = document.getElementById('todayMins');
  if(todayLabel) todayLabel.innerText = todayMins;

  const wheelCtx = document.getElementById('dailyWheel')?.getContext('2d');
  const barCtx = document.getElementById('weeklyBarChart')?.getContext('2d');
  if (!wheelCtx || !barCtx) return;

  // DAILY WHEEL
  if (dailyChart) dailyChart.destroy();
  dailyChart = new Chart(wheelCtx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [todayMins, Math.max(0, 60 - todayMins)], // Goal is 60 mins
        backgroundColor: ['#ffa500', '#eee'],
        borderWidth: 0,
        cutout: '80%'
      }]
    },
    options: { plugins: { tooltip: { enabled: false } }, maintainAspectRatio: false }
  });

  // WEEKLY BAR
  const labels = []; const dataPoints = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    labels.push(days[d.getDay()]);
    dataPoints.push(history[dateStr] || 0);
  }

  if (weeklyChart) weeklyChart.destroy();
  weeklyChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{ data: dataPoints, backgroundColor: '#ffa500', borderRadius: 4 }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { display: false, beginAtZero: true }, x: { grid: { display: false } } }
    }
  });
}

// --- 3. RULES LOGIC (Fixed Delete Button) ---
function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch (e) { return ""; }
}

async function updateSmartSuggest() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const domain = getDomain(tab.url);
  const textEl = document.getElementById('currentDomainText');
  if (domain && !tab.url.startsWith('chrome')) {
    textEl.innerText = domain;
    document.getElementById('quickAddSafe').onclick = () => addRule(domain, 'safe');
    document.getElementById('quickAddBlock').onclick = () => addRule(domain, 'block');
  } else { textEl.innerText = "System Page"; }
}

function addRule(domain, type) {
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

function renderRulesLedger() {
  chrome.storage.local.get(['blocklist', 'allowlist'], (res) => {
    const container = document.getElementById('rulesLedger');
    if(!container) return;
    container.innerHTML = '';
    const all = [...(res.blocklist || []).map(d=>({d,t:'block'})), ...(res.allowlist || []).map(d=>({d,t:'safe'}))];
    
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
        <span style="background:${isBlock?'#fee':'#efe'}; color:${isBlock?'#c33':'#282'}; padding:2px 8px; border-radius:10px; font-size:9px; text-transform:uppercase; margin-right:12px; font-weight:bold; border:1px solid ${isBlock?'#fcc':'#cba'};">${rule.t}</span>
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

// --- 4. FOCUS & POMO ---
document.getElementById('startFocusBtn').onclick = () => {
  const goal = document.getElementById('mainGoalInput').value.trim();
  if (goal) chrome.storage.local.set({ userGoal: goal, sessionActive: true, subTasks: [] }, () => {
    document.getElementById('displayGoal').innerText = goal;
    document.getElementById('setup-view').style.display = 'none';
    document.getElementById('active-view').style.display = 'block';
  });
};

document.getElementById('endFocusBtn').onclick = () => {
  chrome.storage.local.remove(['userGoal', 'sessionActive', 'subTasks', 'pomoActive'], () => {
    chrome.alarms.clearAll();
    
    // NEW: Tell the background script to clear the UI on ALL tabs
    chrome.runtime.sendMessage({ action: "broadcastEndSession" });
    
    location.reload();
  });
};

document.getElementById('startPomoBtn').onclick = () => {
  const mins = parseInt(document.getElementById('pomoMins').value);
  chrome.runtime.sendMessage({ action: "startPomo", minutes: mins });
  const end = Date.now() + (mins * 60000);
  chrome.storage.local.set({ pomoActive: true, pomoEndTime: end });
  document.getElementById('pomo-setup').style.display = 'none';
  document.getElementById('pomo-active').style.display = 'block';
};

document.getElementById('stopPomoBtn').onclick = () => {
  chrome.alarms.clearAll(); chrome.storage.local.set({ pomoActive: false });
  document.getElementById('pomo-setup').style.display = 'block';
  document.getElementById('pomo-active').style.display = 'none';
};

// --- 5. INITIAL LOAD ---
chrome.storage.local.get(['userGoal', 'sessionActive', 'subTasks', 'pomoActive', 'pomoEndTime'], (res) => {
  if (res.sessionActive && res.userGoal) {
    document.getElementById('displayGoal').innerText = res.userGoal;
    document.getElementById('setup-view').style.display = 'none';
    document.getElementById('active-view').style.display = 'block';
    renderTasks(res.subTasks || []);
  }
  if (res.pomoActive) {
    const remaining = Math.max(0, res.pomoEndTime - Date.now());
    const m = Math.floor(remaining / 60000); const s = Math.floor((remaining % 60000) / 1000);
    document.getElementById('timerOutput').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    document.getElementById('pomo-setup').style.display = 'none';
    document.getElementById('pomo-active').style.display = 'block';
  }
});

setInterval(async () => {
  const res = await chrome.storage.local.get(['pomoActive', 'pomoEndTime']);
  if (!res.pomoActive) return;
  const rem = res.pomoEndTime - Date.now();
  if (rem <= 0) { chrome.storage.local.set({ pomoActive: false }); return; }
  const m = Math.floor(rem / 60000); const s = Math.floor((rem % 60000) / 1000);
  document.getElementById('timerOutput').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
}, 1000);

// --- 6. SUB-TASKS ---
document.getElementById('addSubTaskBtn').onclick = () => {
  const text = document.getElementById('subTaskInput').value.trim();
  if (!text) return;
  chrome.storage.local.get(['subTasks'], (res) => {
    const tasks = res.subTasks || [];
    tasks.push({ text: text, completed: false });
    chrome.storage.local.set({ subTasks: tasks }, () => {
      document.getElementById('subTaskInput').value = '';
      renderTasks(tasks);
    });
  });
};

function renderTasks(tasks) {
  const container = document.getElementById('taskList');
  if(!container) return;
  container.innerHTML = '';
  tasks.forEach((task, index) => {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.innerHTML = `<input type="checkbox" ${task.completed ? 'checked' : ''}><span class="${task.completed ? 'completed' : ''}">${task.text}</span>`;
    div.querySelector('input').onchange = (e) => {
      tasks[index].completed = e.target.checked;
      chrome.storage.local.set({ subTasks: tasks }, () => renderTasks(tasks));
    };
    container.appendChild(div);
  });
}

// --- AI COACH MODULE ---
// --- AI COACH MODULE ---

function loadAIReflection() {
  chrome.storage.local.get(['history', 'userGoal'], (res) => {
    const aiText = document.getElementById('aiText');
    const today = new Date().toISOString().split('T')[0];
    const minsToday = (res.history || {})[today] || 0;
    const goal = res.userGoal || "your goals";

    const tips = [
      "Small steps lead to big miles.",
      "Consistency beats intensity every time.",
      "Don't forget to hydrate and blink!",
      "Deep work is a superpower. You're building it."
    ];

    let msg = `Buddy, you've put in ${minsToday} solid minutes into <strong>${goal}</strong> so far. `;
    if (minsToday === 0) msg = `The canvas is still blank for <strong>${goal}</strong>. 5 minutes is all it takes to start. `;
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    aiText.innerHTML = msg + `<br><br><span style="color: #ffa500;">INFO: ${randomTip}</span>`;
    document.getElementById('coachTips').style.display = "block";
  });
}

// Helper to open the Overlay
function openMindfulOverlay(title, desc, showCircle = false) {
  const overlay = document.getElementById('mindfulOverlay');
  const circle = document.getElementById('breathingCircle');
  
  document.getElementById('mindfulTitle').innerText = title;
  document.getElementById('mindfulDesc').innerText = desc;
  
  overlay.style.display = 'flex';
  circle.style.display = showCircle ? 'block' : 'none';
  if(showCircle) circle.style.animation = "breathe 4s infinite ease-in-out";
  else circle.style.animation = "none";
}

// 1. Breathing Exercise
document.getElementById('struggleBtn').onclick = () => {
  openMindfulOverlay("Breathe In...", "Follow the circle. Calm your mind, buddy.", true);
  let isIn = true;
  window.breathInt = setInterval(() => {
    document.getElementById('mindfulTitle').innerText = isIn ? "Breathe Out..." : "Breathe In...";
    isIn = !isIn;
  }, 2000);
};

// 2. 5-4-3-2-1 Grounding
document.getElementById('groundingBtn').onclick = () => {
  const steps = [
    "Identify 5 things you see around you.",
    "Identify 4 things you can touch right now.",
    "Identify 3 things you hear.",
    "Identify 2 things you can smell.",
    "Identify 1 thing you can taste."
  ];
  let currentStep = 0;
  openMindfulOverlay("Grounding", steps[0]);
  
  window.breathInt = setInterval(() => {
    currentStep++;
    if(currentStep < steps.length) {
      document.getElementById('mindfulDesc').innerText = steps[currentStep];
    } else {
      document.getElementById('mindfulTitle').innerText = "Steady Now";
      document.getElementById('mindfulDesc').innerText = "You are here. You are safe. Ready to return?";
      clearInterval(window.breathInt);
    }
  }, 4000);
};

// 3. Positive Affirmations
document.getElementById('affirmationBtn').onclick = () => {
  const notes = [
    "I am capable of doing hard things.",
    "My progress is more important than my speed.",
    "I am in control of my time and my focus.",
    "I choose to be kind to myself while I work.",
    "One distraction does not define my whole day."
  ];
  const randomNote = notes[Math.floor(Math.random() * notes.length)];
  openMindfulOverlay("Daily Affirmation", randomNote);
};

// Close Overlay
document.getElementById('closeMindfulBtn').onclick = () => {
  clearInterval(window.breathInt);
  document.getElementById('mindfulOverlay').style.display = 'none';
};

// 4. Goal Architect (Sub-tasks)
document.getElementById('architectBtn').onclick = () => {
  chrome.storage.local.get(['userGoal', 'subTasks'], (res) => {
    if (!res.userGoal) return alert("Set a goal in the Focus tab first!");
    const goal = res.userGoal.toLowerCase();
    let suggestions = ["Analyze requirements", "Execute primary task", "Quality check"];
    if (goal.includes("code")) suggestions = ["Setup environment", "Write core logic", "Refactor code"];
    if (goal.includes("study") || goal.includes("learn")) suggestions = ["Skim material", "Detailed notes", "Self-quiz"];
    
    const currentTasks = res.subTasks || [];
    const newTasks = [...currentTasks];
    suggestions.forEach(s => {
      if (!currentTasks.some(t => t.text === s)) newTasks.push({ text: s, completed: false });
    });
    chrome.storage.local.set({ subTasks: newTasks }, () => alert("Sub-tasks added!"));
  });
};

// --- Theme Toggle Logic ---
const themeToggle = document.getElementById('themeToggle');

chrome.storage.local.get(['theme'], (res) => {
  if (res.theme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.checked = true;
  }
});

themeToggle.addEventListener('change', () => {
  const isDark = themeToggle.checked;
  document.body.classList.toggle('dark-mode', isDark);
  chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
  // Reload charts to update colors if needed
  if (dailyChart) loadAllStats(); 
});