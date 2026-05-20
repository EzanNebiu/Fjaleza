import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Header } from './components/Header';
import { Game } from './components/Game';
import { Welcome } from './components/Welcome';
import { Modal } from './components/Modal';

function AppContent() {
  const { settings } = useApp();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!settings.hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, [settings.hasSeenWelcome]);

  return (
    <div className="min-h-dvh bg-hacker-bg flex flex-col overflow-x-hidden">
      {/* Header with mode toggle and buttons */}
      <Header />

      {/* Main game */}
      <main className="flex-1 min-h-0 flex items-center justify-center px-3 py-4 sm:px-4 sm:py-8">
        <Game />
      </main>

      {/* Footer */}
      <footer className="border-t border-hacker-border px-4 py-4 text-center text-hacker-text-dim text-xs sm:py-6">
        <p className="mb-2">Daily Albanian word puzzle game</p>
        <div className="space-y-1">
          <p className="font-semibold text-hacker-accent">Made by ELITA Group</p>
          <p className="text-[10px] sm:text-xs">
            <a 
              href="https://ezannebija.dev/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-hacker-accent hover:underline transition-colors font-medium"
            >
              Ezan Nebija
            </a>
            {' • Edi Nebiu • Redon Cikaj • Anila Kadriaj • Rina Gashi'}
          </p>
        </div>
      </footer>

      {/* Welcome Modal */}
      <Modal isOpen={showWelcome} onClose={() => setShowWelcome(false)} title="">
        <Welcome onClose={() => setShowWelcome(false)} />
      </Modal>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
