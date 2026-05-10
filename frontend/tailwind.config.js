/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#7c3aed',
          pink: '#db2777',
          dark: '#0a0a0f',
          card: '#111118',
          border: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0a0a0f 0%, #110d1a 100%)',
      },
      animation: {
        'glitch': 'glitch 0.3s infinite',
        'flicker': 'flicker 0.15s infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'scan': 'scan 8s linear infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)', filter: 'none' },
          '20%': { transform: 'translate(-2px, 2px)', filter: 'hue-rotate(90deg)' },
          '40%': { transform: 'translate(2px, -2px)', filter: 'hue-rotate(-90deg)' },
          '60%': { transform: 'translate(-1px, 1px)', filter: 'saturate(3)' },
          '80%': { transform: 'translate(1px, -1px)', filter: 'brightness(1.5)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124,58,237,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(124,58,237,0.8), 0 0 60px rgba(219,39,119,0.4)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
