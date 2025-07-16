import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        jarvis: {
          gold: '#FFD700',
          red: '#8B0000',
          black: '#000000',
          green: '#00FF00',
        },
      },
      keyframes: {
        'pulse-listening': {
          '0%,100%': { filter: 'drop-shadow(0 0 20px #0f0)' },
          '50%':      { filter: 'drop-shadow(0 0 40px #0f0)' },
        },
        'eyes-glow-green': {
          '0%,100%': { filter: 'drop-shadow(0 0 10px #0f0)' },
          '50%':      { filter: 'drop-shadow(0 0 30px #0f0)' },
        },
      },
      animation: {
        'pulse-listening': 'pulse-listening 2s infinite ease-in-out',
        'eyes-glow-green': 'eyes-glow-green 1.5s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}

export default config