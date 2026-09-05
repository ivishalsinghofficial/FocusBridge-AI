const screenshotToolToggle = document.getElementById('screenshot-tool-toggle');
const screenshotHoldToggle = document.getElementById('screenshot-hold-toggle');
const notepadToolToggle = document.getElementById('notepad-tool-toggle');
const notepadHoldToggle = document.getElementById('notepad-hold-toggle');
const unitConverterToolToggle = document.getElementById('unit-converter-tool-toggle');
const unitConverterHoldToggle = document.getElementById('unit-converter-hold-toggle');
const attentionCheckToggle = document.getElementById('attention-check-toggle');
const homepageToggle = document.getElementById('homepage-toggle');
const nudgeEffectToggle = document.getElementById('nudge-effect-toggle');
const boostStickersToggle = document.getElementById('boost-stickers-toggle');
const nameInput = document.getElementById('name-input');
const saved = document.getElementById('saved');
const homepageBackgroundInput = document.getElementById('homepage-background-input');
const homepageBackgroundPreview = document.getElementById('homepage-background-preview');
const removeHomepageBackground = document.getElementById('remove-homepage-background');

function showHomepageBackground(dataUrl) {
  const hasBackground = Boolean(dataUrl);
  homepageBackgroundPreview.hidden = !hasBackground;
  removeHomepageBackground.hidden = !hasBackground;
  homepageBackgroundPreview.removeAttribute('src');
  if (hasBackground) homepageBackgroundPreview.src = dataUrl;
}

chrome.storage.local.get(['useFocusBridgeHomepage', 'screenshotToolEnabled', 'screenshotHoldEnabled', 'notepadToolEnabled', 'notepadHoldEnabled', 'unitConverterToolEnabled', 'unitConverterHoldEnabled', 'attentionCheckEnabled', 'nudgeBuddyEnabled', 'nudgeTearEffect', 'boostStickersEnabled', 'userName', 'homepageBackground'], data => {
  homepageToggle.checked = data.useFocusBridgeHomepage === true;
  screenshotToolToggle.checked = data.screenshotToolEnabled === true;
  screenshotHoldToggle.checked = data.screenshotHoldEnabled === true;
  notepadToolToggle.checked = data.notepadToolEnabled === true;
  notepadHoldToggle.checked = data.notepadHoldEnabled === true;
  unitConverterToolToggle.checked = data.unitConverterToolEnabled === true;
  unitConverterHoldToggle.checked = data.unitConverterHoldEnabled === true;
  attentionCheckToggle.checked = data.attentionCheckEnabled === true;
  syncToolSubtoggles();
  nudgeEffectToggle.checked = data.nudgeBuddyEnabled ?? !!data.nudgeTearEffect;
  boostStickersToggle.checked = data.boostStickersEnabled !== false;
  nameInput.value = data.userName || '';
  showHomepageBackground(data.homepageBackground);
});

function persist(values) {
  chrome.storage.local.set(values, () => {
    saved.textContent = 'Saved';
    setTimeout(() => { saved.textContent = ''; }, 1500);
  });
}

screenshotToolToggle.addEventListener('change', () => { persist({ screenshotToolEnabled: screenshotToolToggle.checked }); syncToolSubtoggles(); });
screenshotHoldToggle.addEventListener('change', () => persist({ screenshotHoldEnabled: screenshotHoldToggle.checked }));
notepadToolToggle.addEventListener('change', () => { persist({ notepadToolEnabled: notepadToolToggle.checked }); syncToolSubtoggles(); });
notepadHoldToggle.addEventListener('change', () => persist({ notepadHoldEnabled: notepadHoldToggle.checked }));
unitConverterToolToggle.addEventListener('change', () => { persist({ unitConverterToolEnabled: unitConverterToolToggle.checked }); syncToolSubtoggles(); });
unitConverterHoldToggle.addEventListener('change', () => persist({ unitConverterHoldEnabled: unitConverterHoldToggle.checked }));
attentionCheckToggle.addEventListener('change', () => persist({ attentionCheckEnabled: attentionCheckToggle.checked }));
homepageToggle.addEventListener('change', () => persist({ useFocusBridgeHomepage: homepageToggle.checked }));
nudgeEffectToggle.addEventListener('change', () => persist({ nudgeBuddyEnabled: nudgeEffectToggle.checked }));
boostStickersToggle.addEventListener('change', () => persist({ boostStickersEnabled: boostStickersToggle.checked }));
nameInput.addEventListener('change', () => persist({ userName: nameInput.value.trim() }));

function syncToolSubtoggles() {
  [['screenshot-hold-setting', screenshotHoldToggle, screenshotToolToggle], ['notepad-hold-setting', notepadHoldToggle, notepadToolToggle], ['unit-converter-hold-setting', unitConverterHoldToggle, unitConverterToolToggle]].forEach(([id, toggle, parent]) => {
    const row = document.getElementById(id); row.hidden = !parent.checked; toggle.disabled = !parent.checked;
  });
}

function resizeBackground(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxDimension = 1920;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.84));
    };
    image.onerror = () => reject(new Error('That image could not be read.'));
    image.src = dataUrl;
  });
}

homepageBackgroundInput.addEventListener('change', () => {
  const [file] = homepageBackgroundInput.files;
  if (!file) return;
  if (!file.type.startsWith('image/')) { saved.textContent = 'Please choose an image file.'; return; }

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const background = await resizeBackground(reader.result);
      chrome.storage.local.set({ homepageBackground: background }, () => {
        if (chrome.runtime.lastError) { saved.textContent = 'Image is too large to save.'; return; }
        showHomepageBackground(background);
        saved.textContent = 'Background saved';
        setTimeout(() => { saved.textContent = ''; }, 1500);
      });
    } catch (error) {
      saved.textContent = error.message;
    }
  };
  reader.readAsDataURL(file);
});

removeHomepageBackground.addEventListener('click', () => {
  chrome.storage.local.remove('homepageBackground', () => {
    homepageBackgroundInput.value = '';
    showHomepageBackground('');
    saved.textContent = 'Background removed';
    setTimeout(() => { saved.textContent = ''; }, 1500);
  });
});
