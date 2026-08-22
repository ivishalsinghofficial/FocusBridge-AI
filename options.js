const toolsToggle = document.getElementById('tools-toggle');
const homepageToggle = document.getElementById('homepage-toggle');
const nameInput = document.getElementById('name-input');
const saved = document.getElementById('saved');

chrome.storage.local.get(['useFocusBridgeHomepage', 'toolsDockEnabled', 'userName'], data => {
  homepageToggle.checked = data.useFocusBridgeHomepage !== false;
  toolsToggle.checked = data.toolsDockEnabled !== false;
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
nameInput.addEventListener('change', () => persist({ userName: nameInput.value.trim() }));
