import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { AdSlot } from './components/AdSlot';
import { useAdAllowed } from './hooks/useAdAllowed';
import { Board } from './components/Board';
import { ConsentBanner } from './components/ConsentBanner';
import { HelpDialog } from './components/HelpDialog';
import { Header } from './components/Header';
import { Keyboard } from './components/Keyboard';
import { ResultsDialog } from './components/ResultsDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { Toasts } from './components/Toasts';
import { useToasts } from './hooks/useToasts';
import { dayIndex, msUntilNextDay, puzzleNumber } from './game/daily';
import { evaluateGuess, letters } from './game/evaluate';
import { buildShareText, shareResult } from './game/share';
import { EMPTY_STATS, saveStats } from './game/storage';
import { revealDuration, useGame, type GameSnapshot } from './hooks/useGame';
import { usePhysicalKeyboard } from './hooks/usePhysicalKeyboard';
import { useSettings } from './hooks/useSettings';
import { loadGuesses } from './game/words';
import { getConsent } from './monetization/consent';

type DialogName = 'help' | 'stats' | 'settings' | null;

const STATE_WORD = { correct: 'e saktë', present: 'gabim vendi', absent: 'mungon' } as const;

/** Very short screens (landscape phones) do not get the banner: the board needs the room. */
const subscribeTall = (cb: () => void) => {
  const mq = window.matchMedia('(min-height: 700px) and (max-width: 1199px)');
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const isTallNarrow = () => window.matchMedia('(min-height: 700px) and (max-width: 1199px)').matches;

export default function App() {
  const { settings, update, dark, motion } = useSettings();
  const { toasts, show, announcement, announce } = useToasts();
  const [dialog, setDialog] = useState<DialogName>(() => (settings.seenHelp ? null : 'help'));
  const [celebrate, setCelebrate] = useState(false);
  const [today, setToday] = useState(dayIndex);

  const onFinished = useCallback(
    (g: GameSnapshot) => {
      if (g.status === 'won' && motion) setCelebrate(true);
      window.setTimeout(() => setDialog('stats'), g.status === 'won' && motion ? 1500 : 900);
      if (g.mode === 'daily') {
        if (getConsent()?.analytics) {
          import('./monetization/analytics').then((a) =>
            a.trackEvent(g.status === 'won' ? 'fitore' : 'humbje', { guesses: g.guesses.length })
          );
        }
      }
    },
    [motion]
  );

  const {
    game, stats, setStats, keyStates, revealingRow, shakeKey, busy,
    type, erase, submit, startPractice, backToDaily, checkRollover,
  } = useGame({ hardModeSetting: settings.hardMode, motion, events: { toast: show, onFinished } });

  // Announce each revealed row to screen readers once its flip has finished.
  useEffect(() => {
    if (revealingRow !== null || game.guesses.length === 0) return;
    const last = game.guesses[game.guesses.length - 1];
    const evaluation = evaluateGuess(last, game.answer);
    announce(
      letters(last)
        .map((ch, i) => `${ch.toLocaleUpperCase('sq')} ${STATE_WORD[evaluation[i]]}`)
        .join(', ')
    );
  }, [revealingRow, game.guesses, game.answer, announce]);

  // Stop the win hop after it has played.
  useEffect(() => {
    if (!celebrate) return;
    const t = window.setTimeout(() => setCelebrate(false), revealDuration(true) + 900);
    return () => window.clearTimeout(t);
  }, [celebrate]);

  // Day rollover: at local midnight, and whenever the tab becomes visible again.
  useEffect(() => {
    const tick = () => {
      setToday(dayIndex());
      checkRollover(dialog !== 'stats');
    };
    const t = window.setTimeout(tick, msUntilNextDay() + 500);
    const onVisible = () => document.visibilityState === 'visible' && tick();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [checkRollover, dialog, today]);

  // Fetch the valid-guess list in the background so the first Enter is instant.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    idle(() => void loadGuesses());
  }, []);

  usePhysicalKeyboard(dialog === null, { type, erase, submit });

  const onKey = useCallback(
    (key: string) => (key === 'enter' ? submit() : key === 'backspace' ? erase() : type(key)),
    [submit, erase, type]
  );

  const closeDialog = useCallback(() => {
    if (dialog === 'help' && !settings.seenHelp) update('seenHelp', true);
    setDialog(null);
  }, [dialog, settings.seenHelp, update]);

  const onShare = useCallback(async () => {
    const text = buildShareText({
      puzzle: puzzleNumber(game.day),
      guesses: game.guesses,
      answer: game.answer,
      won: game.status === 'won',
      hardMode: game.hardMode,
      colorBlind: settings.colorBlind,
      dark,
      url: import.meta.env.VITE_SITE_URL,
    });
    const text2 = game.mode === 'practice' ? text.replace(/^Fjalëza #\d+/, 'Fjalëza (praktikë)') : text;
    const outcome = await shareResult(text2);
    if (outcome === 'copied') show('Rezultati u kopjua');
    else if (outcome === 'failed') show('Nuk u kopjua. Provo përsëri.');
  }, [game, settings.colorBlind, dark, show]);

  const bannerAllowed = useAdAllowed('banner');
  const sidebarAllowed = useAdAllowed('sidebar');
  const tallNarrow = useSyncExternalStore(subscribeTall, isTallNarrow, () => false);
  const finished = game.status !== 'playing';

  return (
    <>
      <a className="skip-link" href="#board">
        Kalo te loja
      </a>
      <div className="app">
        <Header
          mode={game.mode}
          onPractice={() => {
            setCelebrate(false);
            if (game.mode === 'daily') {
              startPractice();
              show('Praktikë: fjalë e rastësishme');
            } else {
              backToDaily();
            }
          }}
          onHelp={() => setDialog('help')}
          onStats={() => setDialog('stats')}
          onSettings={() => setDialog('settings')}
        />
        {/* Row 2: the consent banner until the visitor decides, then the banner ad. Both sit in
            the layout (never over the board or keyboard), so nothing can be mis-tapped. */}
        <div>
          <ConsentBanner />
          {bannerAllowed && tallNarrow && <AdSlot placement="banner" className="banner-ad" />}
        </div>
        <main className={sidebarAllowed ? 'play has-sidebar' : 'play'}>
          <div className="play-column">
            <p className="mode-line">
              {game.mode === 'daily' ? (
                <>
                  Fjala e ditës <span className="brand-chip">Nr. {puzzleNumber(game.day)}</span>
                </>
              ) : (
                <>
                  Praktikë <span className="brand-chip">nuk llogaritet</span>
                </>
              )}
            </p>
            <div className="board-wrap" id="board" tabIndex={-1} aria-busy={busy}>
              <Board
                guesses={game.guesses}
                current={game.current}
                answer={game.answer}
                revealingRow={revealingRow}
                shakeKey={shakeKey}
                celebrate={celebrate}
              />
            </div>
            <Keyboard states={keyStates} onKey={onKey} />
          </div>
          {sidebarAllowed && (
            <div className="sidebar">
              <AdSlot placement="sidebar" className="sidebar-ad" />
            </div>
          )}
        </main>
      </div>

      <footer className="footer">
        <p className="footer-credit">
          Krijuar nga{' '}
          <a href="https://ezannebija.dev/" rel="author">
            Ezan Nebija
          </a>
        </p>
        <nav className="footer-links" aria-label="Lidhje">
          <a href="/rreth/">Rreth lojës</a>
          <a href="/privatesia/">Privatësia</a>
          <a href="https://ezannebija.dev/">ezannebija.dev</a>
        </nav>
      </footer>

      <Toasts toasts={toasts} announcement={announcement} />

      <HelpDialog open={dialog === 'help'} onClose={closeDialog} />
      <ResultsDialog
        open={dialog === 'stats'}
        onClose={closeDialog}
        stats={stats}
        game={game}
        today={today}
        onShare={onShare}
        onNewPractice={() => {
          setDialog(null);
          setCelebrate(false);
          startPractice();
        }}
        onNewDay={() => {
          setToday(dayIndex());
          if (checkRollover(true)) setDialog(null);
        }}
      />
      <SettingsDialog
        open={dialog === 'settings'}
        onClose={closeDialog}
        settings={settings}
        update={update}
        hardModeLocked={game.mode === 'daily' && game.guesses.length > 0 && !finished}
        onResetStats={() => {
          const empty = { ...EMPTY_STATS, distribution: [...EMPTY_STATS.distribution] };
          saveStats(empty);
          setStats(empty);
          show('Statistikat u fshinë');
        }}
      />
    </>
  );
}
