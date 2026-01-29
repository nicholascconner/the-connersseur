import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: '#8B1538',
          dark: '#6A0F2A',
          light: '#A8234D',
        },
        gold: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#D4AF37',
        },
        cream: {
          DEFAULT: '#F5F5DC',
          light: '#FAFAE8',
          dark: '#E8E8CF',
        },
      },
      fontFamily: {
        script: ['Pacifico', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        extrabold: '800',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.12), 0 10px 40px rgba(139, 21, 56, 0.08)',
        'card-hover': '0 15px 60px rgba(139, 21, 56, 0.15)',
        'header': '0 8px 24px rgba(139, 21, 56, 0.2)',
        'gold': '0 4px 16px rgba(255, 215, 0, 0.4)',
        'gold-hover': '0 8px 24px rgba(255, 215, 0, 0.5)',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};

export default config;
