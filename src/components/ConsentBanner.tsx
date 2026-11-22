import { useState } from 'react';
import { adsActive, analyticsActive } from '../config/monetization';
import { closeConsentManager, needsConsent, setConsent, useConsent, type Consent } from '../monetization/consent';

/**
 * Consent banner: Accept all, Reject all and Manage carry equal weight, nothing is
 * pre-ticked, and the game stays usable while it is shown (it does not block play).
 */
export function ConsentBanner() {
  const { consent, managerOpen } = useConsent();
  if (!needsConsent() || (consent && !managerOpen)) return null;
  // Remount on every opening so the checkboxes start from the stored choice.
  return <ConsentPanel key={consent?.decidedAt ?? 'first'} consent={consent} managerOpen={managerOpen} />;
}

function ConsentPanel({ consent, managerOpen }: { consent: Consent | null; managerOpen: boolean }) {
  const [manage, setManage] = useState(false);
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false);
  const [ads, setAds] = useState(consent?.ads ?? false);
  const showDetails = manage || managerOpen;

  return (
    <section className="consent" role="region" aria-labelledby="consent-title">
      <h2 id="consent-title" className="visually-hidden">
        Privatësia jote
      </h2>
      <p>
        {adsActive() && analyticsActive()
          ? 'Me lejen tënde shfaqim reklama (Google, me cookies) dhe matim vizitat në mënyrë anonime.'
          : adsActive()
            ? 'Me lejen tënde shfaqim reklama nga Google, që përdorin cookies.'
            : 'Me lejen tënde matim vizitat në mënyrë anonime, pa cookies.'}{' '}
        Loja funksionon njësoj edhe pa to. <a href="/privatesia/">Më shumë</a>
      </p>
      {showDetails && (
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {analyticsActive() && (
            <label className="setting small">
              <span>
                <strong>Statistika anonime</strong>
                <br />
                <span className="muted">Numri i vizitave dhe lojërave, pa të dhëna personale.</span>
              </span>
              <input
                type="checkbox"
                aria-label="Statistika anonime"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                style={{ width: 22, height: 22 }}
              />
            </label>
          )}
          {adsActive() && (
            <label className="setting small">
              <span>
                <strong>Reklama</strong>
                <br />
                <span className="muted">Google AdSense dhe partnerët e tij, me cookies.</span>
              </span>
              <input
                type="checkbox"
                aria-label="Reklama"
                checked={ads}
                onChange={(e) => setAds(e.target.checked)}
                style={{ width: 22, height: 22 }}
              />
            </label>
          )}
        </div>
      )}

      <div className="consent-actions">
        <button type="button" className="btn" onClick={() => setConsent({ analytics: false, ads: false })}>
          Refuzo
        </button>
        {showDetails ? (
          <button type="button" className="btn" onClick={() => setConsent({ analytics, ads })}>
            Ruaj
          </button>
        ) : (
          <button type="button" className="btn" onClick={() => setManage(true)}>
            Menaxho
          </button>
        )}
        <button type="button" className="btn primary" onClick={() => setConsent({ analytics: true, ads: true })}>
          Prano
        </button>
        {managerOpen && consent && (
          <button type="button" className="btn" onClick={closeConsentManager}>
            Mbyll
          </button>
        )}
      </div>
    </section>
  );
}
