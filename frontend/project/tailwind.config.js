/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF9',
          100: '#FFF9F0', // warm cream
          200: '#FAF3E7',
          300: '#EFE5D5',
        },
        sage: {
          50: '#F6F9F5',
          100: '#E7F0E4', // pale mint
          200: '#D1E0CD',
          300: '#A8BE9B', // soft sage
          400: '#8EAA80',
          500: '#6B8E5D',
          600: '#4D6E42',
          700: '#315A48', // deep forest green
          800: '#234234',
          900: '#172B22',
        },
        mint: {
          50: '#F2FAF5',
          100: '#E7F0E4',
          200: '#CBE5D4',
          300: '#9ED1B0',
          400: '#74C69D',
        },
        butter: {
          50: '#FFFDF7',
          100: '#FEF8EA',
          200: '#FDF1D0',
          300: '#F7DEA0', // butter yellow
          400: '#EBCB7A',
        },
        peach: {
          50: '#FFF9F5',
          100: '#FDEEE7',
          200: '#FADCCE',
          300: '#F5C4AD', // soft peach
          400: '#E8A598', // rose blush
          500: '#D47E6F',
        },
        bloom: {
          dark: '#263D34',  // main text
          muted: '#78857D', // muted text
          border: '#EFE8DC', // warm subtle border
          card: '#FFFFFF',
          surface: '#FDFBF7',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(49, 90, 72, 0.05)',
        'soft-md': '0 8px 30px -4px rgba(49, 90, 72, 0.07)',
        'soft-lg': '0 16px 40px -6px rgba(49, 90, 72, 0.09)',
        'clay': '0 4px 0 #CADBCE, 0 8px 20px rgba(49, 90, 72, 0.07)',
        'clay-active': '0 1px 0 #CADBCE, 0 2px 6px rgba(49, 90, 72, 0.05)',
      }
    },
  },
  plugins: [],
}