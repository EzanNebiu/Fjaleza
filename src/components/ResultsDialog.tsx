import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Share2 } from 'lucide-react';
import { Dialog } from './Dialog';
import { AdSlot } from './AdSlot';
import { MAX_GUESSES } from '../game/constants';
import { formatCountdown, msUntilNextDay, puzzleNumber } from '../game/daily';
import { visibleStreak, type Stats } from '../game/storage';
import type { GameSnapshot } from '../hooks/useGame';

function Countdown({ onZero }: { onZero: () => void }) {
  const [ms, setMs] = useState(() => msUntilNextDay());
  const prev = useRef(ms);
  useEffect(() => {
    const id = window.setInterval(() => {
      const left = msUntilNextDay();
      // The remaining time jumps back up to about 24h right after midnight.
      if (left > prev.current + 1000) onZero();
      prev.current = left;
      setMs(left);
    }, 1000);
    return () => window.clearInterval(id);
  }, [onZero]);
  return (
    <div className="countdown">
      <div className="small muted">Fjala e radhës pas</div>
      <div className="countdown-time" role="timer" aria-live="off">
        {formatCountdown(ms)}
      </div>
    </div>
  );
}

interface ResultsDialogProps {
  open: boolean;
  onClose: () => void;
  stats: Stats;
  game: GameSnapshot;
  today: number;
  onShare: () => void;
  onNewPractice: () => void;
  onNewDay: () => void;
}

export function ResultsDialog({ open, onClose, stats, game, today, onShare, onNewPractice, onNewDay }: ResultsDialogProps) {
  const finished = game.status !== 'playing';
  const winPct = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxCount = Math.max(1, ...stats.distribution);
  const highlight = game.mode === 'daily' && game.status === 'won' ? game.guesses.length - 1 : -1;

  return (
    <Dialog open={open} onClose={onClose} title={finished ? 'Rezultati' : 'Statistikat'}>
      {finished && (
        <section className="result-head">
          <h3>{game.status === 'won' ? 'E gjete!' : 'Herën tjetër!'}</h3>
          <p className="muted">
            {game.status === 'won'
              ? `Me ${game.guesses.length} përpjekje. Fjala ishte`
              : 'Fjala ishte'}
          </p>
          <p className="answer-word">{game.answer}</p>
        </section>
      )}

      {finished && (
        <section className="end-actions">
          {game.mode === 'daily' ? (
            <Countdown onZero={onNewDay} />
          ) : (
            <button type="button" className="btn" onClick={onNewPractice}>
              <RotateCcw aria-hidden="true" /> Fjalë e re
            </button>
          )}
          <button type="button" className="btn primary" onClick={onShare}>
            <Share2 aria-hidden="true" /> Ndaje
          </button>
        </section>
      )}

      {finished && <AdSlot placement="endOfGame" />}

      <section>
        <h3>Fjala e ditës</h3>
        <div className="stat-grid">
          <div>
            <div className="stat-value">{stats.played}</div>
            <div className="stat-label">Lojëra</div>
          </div>
          <div>
            <div className="stat-value">{winPct}</div>
            <div className="stat-label">% fitore</div>
          </div>
          <div>
            <div className="stat-value">{visibleStreak(stats, today)}</div>
            <div className="stat-label">Seria aktuale</div>
          </div>
          <div>
            <div className="stat-value">{stats.maxStreak}</div>
            <div className="stat-label">Seria më e gjatë</div>
          </div>
        </div>
      </section>

      <section>
        <h3>Shpërndarja e përpjekjeve</h3>
        {stats.wins === 0 ? (
          <p className="small muted">Ende pa fitore. Rezultatet e fjalës së ditës shfaqen këtu.</p>
        ) : (
          <div className="dist">
            {stats.distribution.slice(0, MAX_GUESSES).map((count, i) => (
              <div className="dist-row" key={i}>
                <span>{i + 1}</span>
                <span
                  className={i === highlight ? 'dist-bar current' : 'dist-bar'}
                  style={{ width: `${Math.max(8, (count / maxCount) * 100)}%` }}
                  aria-label={`${count} fitore me ${i + 1} përpjekje`}
                >
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {!finished && game.mode === 'daily' && (
        <p className="small muted">Fjalëza Nr. {puzzleNumber(game.day)} është ende në lojë.</p>
      )}
    </Dialog>
  );
}
