function dataUrlToBlob(dataUrl) {
  const match = /^data:([^;,]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error('Invalid screenshot image data.');
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: match[1] });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== 'clipboard-document') return false;
  (async () => {
    try {
      const blob = dataUrlToBlob(message.dataUrl);
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      sendResponse({ success: true });
    } catch (error) {
      console.error('Clipboard copy failed:', error?.name, error?.message, error);
      sendResponse({ success: false, error: (error?.name || 'Error') + ': ' + (error?.message || 'Clipboard write failed.') });
    }
  })();
  return true;
});
