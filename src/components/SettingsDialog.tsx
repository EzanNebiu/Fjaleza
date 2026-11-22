import { useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Dialog } from './Dialog';
import { MONETIZATION } from '../config/monetization';
import type { Settings } from '../game/storage';
import type { ThemeSetting } from '../game/types';
import { isAdFree, startAdFreeCheckout } from '../monetization/adFree';
import { needsConsent, openConsentManager } from '../monetization/consent';

function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <div className="setting">
      <div className="setting-text">
        <span className="setting-title">{label}</span>
        <span className="small muted">{description}</span>
      </div>
      <button
        type="button"
        role="switch"
        className="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span className="switch-track" />
      </button>
    </div>
  );
}

const THEMES: { value: ThemeSetting; label: string; Icon: typeof Sun }[] = [
  { value: 'system', label: 'Sistemi', Icon: Monitor },
  { value: 'light', label: 'Çelët', Icon: Sun },
  { value: 'dark', label: 'Errët', Icon: Moon },
];

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  hardModeLocked: boolean;
  onResetStats: () => void;
}

export function SettingsDialog({ open, onClose, settings, update, hardModeLocked, onResetStats }: SettingsDialogProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={() => {
        setConfirmReset(false);
        onClose();
      }}
      title="Cilësimet"
    >
      <Switch
        label="Modaliteti i vështirë"
        description={
          hardModeLocked
            ? 'Mund ta ndryshosh vetëm para përpjekjes së parë të fjalës së ditës.'
            : 'Shkronjat e zbuluara duhet të përdoren në përpjekjet e tjera.'
        }
        checked={settings.hardMode}
        disabled={hardModeLocked}
        onChange={(v) => update('hardMode', v)}
      />

      <div className="setting">
        <div className="setting-text">
          <span className="setting-title" id="theme-label">
            Pamja
          </span>
          <span className="small muted">E çelët, e errët ose si sistemi.</span>
        </div>
        <div className="segmented" role="radiogroup" aria-labelledby="theme-label">
          {THEMES.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={settings.theme === value}
              aria-label={label}
              title={label}
              onClick={() => update('theme', value)}
            >
              <Icon aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <Switch
        label="Ngjyra për daltonikë"
        description="Portokalli dhe blu në vend të gjelbrës dhe të verdhës."
        checked={settings.colorBlind}
        onChange={(v) => update('colorBlind', v)}
      />

      <Switch
        label="Pa animacione"
        description="Çaktivizon rrotullimin dhe dridhjen e kutive. Ndjek edhe cilësimin e sistemit."
        checked={settings.reducedMotion === 'on'}
        onChange={(v) => update('reducedMotion', v ? 'on' : 'system')}
      />

      {MONETIZATION.adFree.enabled && !isAdFree() && (
        <>
          <hr className="divider" />
          <div className="setting">
            <div className="setting-text">
              <span className="setting-title">Pa reklama</span>
              <span className="small muted">Pagesë e vetme. {MONETIZATION.adFree.priceLabel}</span>
            </div>
            <button type="button" className="btn" onClick={startAdFreeCheckout}>
              Hiq reklamat
            </button>
          </div>
        </>
      )}

      <hr className="divider" />

      <div className="link-row small">
        {needsConsent() && (
          <button type="button" className="btn" onClick={() => { onClose(); openConsentManager(); }}>
            Zgjedhjet e privatësisë
          </button>
        )}
        <a href="/rreth/">Rreth lojës</a>
        <a href="/privatesia/">Politika e privatësisë</a>
      </div>

      <div>
        {confirmReset ? (
          <div className="end-actions">
            <button type="button" className="btn" onClick={() => setConfirmReset(false)}>
              Anulo
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                onResetStats();
                setConfirmReset(false);
              }}
            >
              Po, fshiji
            </button>
          </div>
        ) : (
          <button type="button" className="btn danger btn-block" onClick={() => setConfirmReset(true)}>
            Fshi statistikat
          </button>
        )}
      </div>
    </Dialog>
  );
}
