const key = 'otaku-verso-analytics';
const panel = document.querySelector<HTMLElement>('#consent');
let analyticsStarted = false;
const disabledKey = 'ga-disable-G-1S01GEB5CF';
const analyticsWindow = window as unknown as Record<string, unknown>;

function readConsent() {
  try { return localStorage.getItem(key); } catch { return null; }
}
async function enableAnalytics() {
  analyticsWindow[disabledKey] = false;
  if (analyticsStarted) return;
  try {
    const [{ app }, { getAnalytics, isSupported, logEvent }] = await Promise.all([
      import('../lib/firebase'), import('firebase/analytics'),
    ]);
    // The visitor may revoke consent while the asynchronous imports are loading.
    if (readConsent() !== 'yes' || !await isSupported()) return;
    const analytics = getAnalytics(app);
    analyticsStarted = true;
    document.querySelector('#apk-download')?.addEventListener('click', () => {
      if (readConsent() === 'yes') logEvent(analytics, 'download_apk');
    });
  } catch { /* Statistics never prevent using the website. */ }
}
function saveConsent(value: 'yes' | 'no') {
  try { localStorage.setItem(key, value); } catch { /* Consent isn't persisted if storage is unavailable. */ }
  if (panel) panel.hidden = true;
  if (value === 'yes') void enableAnalytics();
  else analyticsWindow[disabledKey] = true;
}
analyticsWindow[disabledKey] = true;
if (!readConsent() && panel) panel.hidden = false;
if (readConsent() === 'yes') void enableAnalytics();
document.querySelector('#consent-yes')?.addEventListener('click', () => saveConsent('yes'));
document.querySelector('#consent-no')?.addEventListener('click', () => saveConsent('no'));
document.querySelector('#privacy-settings')?.addEventListener('click', () => {
  if (panel) { panel.hidden = false; document.querySelector<HTMLButtonElement>('#consent-no')?.focus(); }
});
