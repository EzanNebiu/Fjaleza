# Fjalëza 🇦🇱

**A daily Albanian word puzzle game** - Wordle but for Albanian language!

Fjalëza is a production-ready word puzzle game that challenges players to guess a 5-letter Albanian word in 6 attempts. The game features intelligent Albanian language support with context-aware digraph tokenization (handling special characters like "dh", "gj", "ll", "nj", etc.), daily puzzles, practice mode, and comprehensive statistics tracking.

## ✨ Features

### 🎮 Game Modes
- **Daily Mode**: One puzzle per day, same for everyone - compete with friends!
- **Practice Mode**: Unlimited random words to practice your Albanian vocabulary
- **Hard Mode**: Must use revealed hints in subsequent guesses (can be toggled mid-game)

### 🔤 Albanian Language Support
- Context-aware tokenization for Albanian digraphs (dh, gj, ll, nj, rr, sh, th, xh, zh, ç, ë)
- Handles special 3-character tokens (dhi, gji, nji)
- Smart word validation using the Fjalorthi Albanian dictionary API
- Fallback validation for conjugated forms
- Over 200 carefully curated 5-character Albanian words

### 📊 Statistics & Progress
- Track your performance with detailed statistics
- Current and longest win streaks
- Win distribution histogram
- Play count and win percentage
- Stats persist in localStorage

### 🎨 User Experience
- **Dark hacker-green theme** with cyberpunk aesthetics
- Fully responsive design (mobile-first)
- Smooth animations and transitions
- Accessibility features:
  - Reduced motion mode for users sensitive to animations
  - High contrast mode for better visibility
  - Keyboard navigation support
- Color-coded feedback (green = correct, yellow = wrong position, gray = not in word)
- Real-time keyboard state tracking
- Error messages for invalid guesses and hard mode violations

### ⚡ Performance & Quality
- Fast React 19 with TypeScript 6
- Vite 8 for lightning-fast builds
- Comprehensive test coverage (47+ tests)
- LocalStorage caching for API responses
- Optimized rendering with memoization

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/EzanNebiu/fjaleza.git
cd fjaleza

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

### Deploy to Vercel

```bash

### Run Tests

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test -- --run
```

## 🏗️ Tech Stack

### Frontend
- **React 19** - Modern UI library with concurrent features
- **TypeScript 6** - Type-safe JavaScript
- **Vite 8** - Next-generation frontend tooling
- **Tailwind CSS v3** - Utility-first CSS framework

### Testing
- **Vitest** - Fast unit test framework
- **React Testing Library** - Testing utilities for React
- **@testing-library/user-event** - User interaction simulation

### Development
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **lucide-react** - Beautiful icon library

## 📁 Project Structure

```
fjaleza/
├── src/
│   ├── components/        # React components
│   │   ├── Game.tsx       # Main game orchestrator
│   │   ├── Grid.tsx       # Word grid display
│   │   ├── Keyboard.tsx   # Virtual keyboard
│   │   ├── Header.tsx     # App header with controls
│   │   ├── Modal.tsx      # Reusable modal component
│   │   ├── GameOverModal.tsx
│   │   └── ...
│   ├── contexts/          # React contexts
│   │   └── AppContext.tsx # Global app state
│   ├── core/              # Core game logic
│   │   ├── albanianTokenizer.ts  # Albanian text tokenization
│   │   └── gameEngine.ts         # Game rules & validation
│   ├── data/              # Game data
│   │   ├── words.ts       # Albanian word lists
│   │   └── wordRepository.ts
│   ├── hooks/             # Custom React hooks
│   │   ├── useGameState.ts
│   │   ├── useInputManager.ts
│   │   └── useKeyboard.ts
│   ├── services/          # External services
│   │   └── fjalorthi/     # Fjalorthi API integration
│   ├── utils/             # Utility functions
│   │   ├── storage.ts     # localStorage helpers
│   │   └── wordValidation.ts
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── public/                # Static assets
├── tests/                 # Test files
└── package.json
```

## 🧪 Testing

The project includes comprehensive test coverage:

- **26 tests** for Albanian tokenizer (edge cases, digraphs, special characters)
- **21 tests** for game engine (guess evaluation, win/loss conditions, hard mode)
- **Integration tests** for component interactions

Run tests with:
```bash
npm test
```

## 🎯 How to Play

1. **Guess the word**: Enter a 5-letter Albanian word
2. **Get feedback**: 
   - 🟩 Green = Letter is correct and in the right position
   - 🟨 Yellow = Letter is in the word but wrong position
   - ⬜ Gray = Letter is not in the word
3. **Win or lose**: You have 6 attempts to guess the word
4. **Daily puzzle**: Come back every day for a new word!
5. **Practice mode**: Play unlimited games to improve your Albanian vocabulary

## 🌐 Albanian Language Features

Fjalëza intelligently handles Albanian special characters and digraphs:

- **Digraphs** (2 characters counted as 1): dh, gj, ll, nj, rr, sh, th, xh, zh
- **Special characters**: ç, ë
- **3-character tokens** (special cases): dhi, gji, nji
- **Example**: "GJUHA" = 5 characters (GJ-U-H-A)

## 🔧 Configuration

### Word Validation
The app uses the [Fjalorthi API](https://fjalorthi.com/) for Albanian word validation with:
- 30-day caching to reduce API calls
- Fallback to local word list for conjugated forms
- Request timeout of 10 seconds

### Game Settings
- Max guesses: 6
- Word length: 5 characters
- Daily puzzle timezone: Europe/Belgrade

## 👥 Team

**Made by ELITA Group:**
- **[Ezan Nebija](https://ezannebija.dev/)** - Lead Developer
- **Edi Nebiu** - Developer
- **Redon Cikaj** - Developer
- **Anila Kadriaj** - Developer
- **Rina Gashi** - Developer

## 📄 License

MIT License - feel free to use this project for learning or building your own word puzzle games!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 🙏 Acknowledgments

- Word validation powered by [Fjalorthi](https://fjalorthi.com/) - Albanian dictionary API
- Inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html)
- Icons by [Lucide](https://lucide.dev/)

---

**Fjalëza** - Mëso shqip duke u argëtuar! Learn Albanian while having fun! 🇦🇱
