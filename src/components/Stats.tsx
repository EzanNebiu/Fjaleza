/**
 * Stats Display Component
 * 
 * Shows game statistics and guess distribution
 */

import type { GameStats } from '../types';

interface StatsProps {
  stats: GameStats;
}

export function Stats({ stats }: StatsProps) {
  const winPercentage = stats.played > 0 
    ? Math.round((stats.wins / stats.played) * 100) 
    : 0;

  // Find max for scaling distribution bars
  const maxGuesses = Math.max(...Object.values(stats.guessDistribution), 1);

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2 text-center sm:gap-4">
        <div>
          <div className="text-2xl font-bold text-hacker-accent sm:text-3xl">{stats.played}</div>
          <div className="text-xs text-hacker-text-dim uppercase">Played</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-hacker-accent sm:text-3xl">{winPercentage}</div>
          <div className="text-xs text-hacker-text-dim uppercase">Win %</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-hacker-accent sm:text-3xl">{stats.currentStreak}</div>
          <div className="text-xs text-hacker-text-dim uppercase">Current Streak</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-hacker-accent sm:text-3xl">{stats.maxStreak}</div>
          <div className="text-xs text-hacker-text-dim uppercase">Max Streak</div>
        </div>
      </div>

      {/* Guess distribution */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-hacker-text uppercase">Guess Distribution</h3>
        {[1, 2, 3, 4, 5, 6].map(guessNum => {
          const count = stats.guessDistribution[guessNum] || 0;
          const percentage = maxGuesses > 0 ? (count / maxGuesses) * 100 : 0;

          return (
            <div key={guessNum} className="flex items-center gap-2">
              <div className="text-sm font-medium text-hacker-text-dim w-4">{guessNum}</div>
              <div className="flex-1 bg-hacker-surface rounded overflow-hidden">
                <div
                  className="bg-hacker-accent text-hacker-bg text-xs font-bold py-1 px-2 text-right transition-all"
                  style={{ width: `${Math.max(percentage, count > 0 ? 10 : 0)}%` }}
                >
                  {count > 0 ? count : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
