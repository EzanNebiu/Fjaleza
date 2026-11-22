import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/bricolage-grotesque/latin-700.css';
import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import './styles.css';
import App from './App';
import { analyticsActive } from './config/monetization';
import { CONSENT_EVENT, getConsent } from './monetization/consent';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Analytics code is a separate chunk, fetched only once consent is given.
function maybeStartAnalytics() {
  if (analyticsActive() && getConsent()?.analytics) {
    import('./monetization/analytics').then((m) => m.startAnalytics());
  }
}
maybeStartAnalytics();
window.addEventListener(CONSENT_EVENT, maybeStartAnalytics);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support is optional */
    });
  });
}
