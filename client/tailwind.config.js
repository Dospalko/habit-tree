// tailwind.config.js (vytvor ho manuálne v koreni projektu)
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html", // Ak používaš Tailwind triedy aj v index.html
      "./src/**/*.{js,jsx,ts,tsx}", // Cesty k tvojim komponentom
    ],
    theme: {
      extend: { // Dôležité je použiť `extend`, aby si neprepísal defaultnú tému
        colors: {
          'cosmic-bg': '#0F1020',
          'cosmic-card': '#1C1D30',
          'cosmic-text-main': '#E8E9F3',
          'cosmic-text-muted': '#9195B2',
          'cosmic-accent-primary': '#A020F0',      // Elektrická Fialová
          'cosmic-accent-primary-hover': '#B533FF', // Trochu svetlejšia pre hover
          'cosmic-accent-secondary': '#FF7F50',    // Koralová/Broskyňová
          'cosmic-accent-secondary-hover': '#FF9466',
          'cosmic-success': '#00C896',
          'cosmic-success-hover': '#00E0A8',
          'cosmic-danger': '#E03C3C',
          'cosmic-danger-hover': '#F04C4C',
          'cosmic-border': '#353852',
          'cosmic-input-bg': '#2A2C47', // Trochu odlišné pozadie pre inputy
        },
        fontFamily: {
          'nunito': ['"Nunito"', 'sans-serif'], // Daj názvy fontov do úvodzoviek, ak obsahujú medzery
          'merriweather': ['"Merriweather"', 'serif'],
        },
        boxShadow: {
          'glow-primary': '0 0 18px 3px rgba(160, 32, 240, 0.45)', // Intenzívnejšia žiara
          'glow-secondary': '0 0 18px 3px rgba(255, 127, 80, 0.45)',
          'glow-success': '0 0 15px 2px rgba(0, 200, 150, 0.4)',
          'card-glow': '0 0 25px -5px rgba(160, 32, 240, 0.2)', // Jemná žiara pre karty
        },
        borderRadius: {
          'xl': '1rem', // Defaultne je 0.75rem, môžeme zväčšiť
          '2xl': '1.5rem',
        },
        animation: {
          'pulse-glow': 'pulse-glow 2.5s infinite ease-in-out',
          'subtle-float': 'subtle-float 6s infinite ease-in-out',
        },
        keyframes: {
          'pulse-glow': {
            '0%, 100%': { opacity: '0.7', boxShadow: '0 0 10px 1px rgba(160, 32, 240, 0.3)' },
            '50%': { opacity: '1', boxShadow: '0 0 20px 4px rgba(160, 32, 240, 0.55)' },
          },
          'subtle-float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-8px)' },
          }
        }
      },
    },
    plugins: [
      // Tu môžeš pridať Tailwind pluginy, ak nejaké používaš
    ],
  }