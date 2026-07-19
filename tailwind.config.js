/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark base – rich forest green for hero, nav, footer
        obsidian: {
          DEFAULT: '#1B4A28',
          light: '#245E33',
          mid: '#2E7040',
        },
        // Light meadow green – main page/section background
        meadow: {
          DEFAULT: '#E8F5E8',
          dark: '#D4ECD4',
          light: '#F2FAF2',
          mid: '#C8E4C8',
        },
        // Brand primary – amber/orange
        gold: {
          DEFAULT: '#C8822A',
          light: '#E09840',
          bright: '#F0A850',
          dark: '#8A5818',
          muted: '#7A5020',
        },
        // Brand secondary – burgundy
        maroon: {
          DEFAULT: '#7A1E2A',
          light: '#9E2838',
          dark: '#561018',
        },
        // Sage green accent
        sage: {
          DEFAULT: '#4A7062',
          light: '#5E8A7A',
          dark: '#344E46',
        },
        // Dark green text (on light bg)
        forest: {
          DEFAULT: '#162814',
          mid: '#2E5034',
          muted: '#4A6E50',
          border: '#6A9A70',
        },
        // Neutrals
        steel: {
          DEFAULT: '#1E3224',
          light: '#2A4432',
          dark: '#102018',
        },
        ember: {
          DEFAULT: '#8B2010',
          light: '#B83020',
          glow: '#FF4422',
        },
        stone: {
          DEFAULT: '#4A6A50',
          light: '#6A8A70',
          lighter: '#8AAA90',
        },
        // Parchment/cream
        parchment: {
          DEFAULT: '#F0E6D0',
          dark: '#D8C8A8',
          darker: '#B8A888',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        cinzel_deco: ['"Cinzel Decorative"', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C8822A 0%, #F0A850 50%, #8A5818 100%)',
        'dark-gradient': 'linear-gradient(180deg, #1B4A28 0%, #245E33 100%)',
        'meadow-gradient': 'linear-gradient(180deg, #E8F5E8 0%, #D4ECD4 100%)',
        'ember-glow': 'radial-gradient(ellipse at center, rgba(200,80,20,0.3) 0%, transparent 70%)',
        'gold-glow': 'radial-gradient(ellipse at center, rgba(200,130,42,0.4) 0%, transparent 70%)',
        'forest-glow': 'radial-gradient(ellipse at center, rgba(36,94,51,0.5) 0%, transparent 70%)',
      },
      animation: {
        'flicker': 'flicker 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fog': 'fog 20s linear infinite',
        'star-pulse': 'starPulse 1.5s ease-in-out infinite',
        'scroll-bounce': 'scrollBounce 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'candle': 'candle 4s ease-in-out infinite',
        'bounce-slow': 'bounceSlow 2s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '10%': { opacity: '0.75' },
          '20%': { opacity: '1' },
          '50%': { opacity: '0.65' },
          '60%': { opacity: '1' },
          '80%': { opacity: '0.9' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fog: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(50%)' },
        },
        starPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px #C8822A)', transform: 'scale(1)' },
          '50%': { filter: 'drop-shadow(0 0 10px #F0A850)', transform: 'scale(1.2)' },
        },
        scrollBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(8px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(200,130,42,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(200,130,42,0.5), 0 0 80px rgba(200,130,42,0.15)' },
        },
        candle: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '33%': { opacity: '0.6', transform: 'scale(0.95)' },
          '66%': { opacity: '1', transform: 'scale(1.05)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      boxShadow: {
        'gold': '0 0 30px rgba(200,130,42,0.35)',
        'gold-lg': '0 0 60px rgba(200,130,42,0.45)',
        'ember': '0 0 30px rgba(139,32,16,0.5)',
        'warm': '0 0 40px rgba(160,80,20,0.3)',
        'forest': '0 8px 30px rgba(27,74,40,0.25)',
        'forest-lg': '0 16px 50px rgba(27,74,40,0.35)',
        'inner-dark': 'inset 0 2px 20px rgba(0,0,0,0.4)',
        'card': '0 4px 20px rgba(27,74,40,0.12)',
        'card-hover': '0 8px 40px rgba(27,74,40,0.2), 0 0 20px rgba(200,130,42,0.1)',
      },
    },
  },
  plugins: [],
};
