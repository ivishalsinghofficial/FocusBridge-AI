const toolsToggle = document.getElementById('tools-toggle');
const homepageToggle = document.getElementById('homepage-toggle');
const nudgeEffectToggle = document.getElementById('nudge-effect-toggle');
const boostStickersToggle = document.getElementById('boost-stickers-toggle');
const nameInput = document.getElementById('name-input');
const saved = document.getElementById('saved');

chrome.storage.local.get(['useFocusBridgeHomepage', 'toolsDockEnabled', 'nudgeBuddyEnabled', 'nudgeTearEffect', 'boostStickersEnabled', 'userName'], data => {
  homepageToggle.checked = data.useFocusBridgeHomepage !== false;
  toolsToggle.checked = data.toolsDockEnabled !== false;
  nudgeEffectToggle.checked = data.nudgeBuddyEnabled ?? !!data.nudgeTearEffect;
  boostStickersToggle.checked = data.boostStickersEnabled !== false;
  nameInput.value = data.userName || '';
});

function persist(values) {
  chrome.storage.local.set(values, () => {
    saved.textContent = 'Saved';
    setTimeout(() => { saved.textContent = ''; }, 1500);
  });
}

toolsToggle.addEventListener('change', () => persist({ toolsDockEnabled: toolsToggle.checked }));
homepageToggle.addEventListener('change', () => persist({ useFocusBridgeHomepage: homepageToggle.checked }));
nudgeEffectToggle.addEventListener('change', () => persist({ nudgeBuddyEnabled: nudgeEffectToggle.checked }));
boostStickersToggle.addEventListener('change', () => persist({ boostStickersEnabled: boostStickersToggle.checked }));
nameInput.addEventListener('change', () => persist({ userName: nameInput.value.trim() }));
