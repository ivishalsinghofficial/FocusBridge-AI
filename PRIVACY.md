# Privacy Policy for FocusBridge AI

**Last updated: August 22, 2026**

FocusBridge AI is a Chrome extension that helps you stay focused. We do not operate a server that receives, stores, sells, or shares your personal data.

## Information stored on your device

FocusBridge AI stores settings, goals, task lists, productivity history, and website rules in `chrome.storage.local` on your device. Captures you choose to save are stored in your browser's local extension database. This data is used to provide the extension's features and is not sent to FocusBridge AI's developer.

The extension can analyze the current page to provide focus nudges and Recall Anchor challenges. It requests access to all sites because these features need to work on the site you are currently viewing. It does not upload a browsing-history log to our servers.

## Optional AI features and API keys

Recall Anchor is optional. If you enable it and provide your own Gemini or OpenAI API key, FocusBridge AI stores that key in `chrome.storage.local` in your Chrome profile. It is not sent to the FocusBridge AI developer or through a FocusBridge AI server.

When you request a Recall Anchor quiz, the extension sends up to 2,000 characters of text extracted from the active page, along with the quiz prompt, directly to the provider you selected:

- Google Gemini: `generativelanguage.googleapis.com`
- OpenAI: `api.openai.com`

Those providers process the request under their own terms and privacy policies. Do not use Recall Anchor on pages containing information you do not want to disclose to your selected AI provider. Use restricted, revocable API keys and set provider-side spending limits where available.

## Other network requests

The local AI feature may download model files from Hugging Face and supporting WebAssembly files from jsDelivr. The extension may also retrieve focus quotes from The Quotes Hub. These requests are made directly from your browser to those services.

## Screenshots and clipboard

Screenshot and clipboard features run only in response to your action. A screenshot copied to the clipboard is not sent to an external service. Captures you choose to save are stored locally in your browser profile until you delete them.

## Data sharing and retention

FocusBridge AI does not use advertising trackers or analytics. We do not sell or share your data. Local data remains in your browser profile until you delete it, remove it through Chrome, or uninstall the extension. Data sent through an optional AI feature is subject to the selected provider's retention and privacy practices.

## Security

Browser local storage is not a dedicated hardware-backed secret vault. Keep your browser profile secure and revoke a key promptly if you suspect it was exposed. You can remove your saved API key in the extension at any time.

## Contact

For privacy questions, contact ivishalsinghofficial@gmail.com.
