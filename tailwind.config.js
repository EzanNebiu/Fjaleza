/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark hacker-green theme
        'hacker': {
          bg: '#0a0e0a',
          surface: '#141914',
          border: '#1f2d1f',
          text: '#e8f4e8',
          'text-dim': '#8fa98f',
          accent: '#00ff41',
          'accent-dim': '#00cc33',
          correct: '#00ff41',
          present: '#ffc107',
          absent: '#4a4a4a',
          error: '#ff4444',
        },
      },
      animation: {
        'flip': 'flip 0.5s ease',
        'shake': 'shake 0.5s ease',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateX(0)' },
          '50%': { transform: 'rotateX(-90deg)' },
          '100%': { transform: 'rotateX(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(10px)' },
        },
      },
    },
  },
  plugins: [],
}

