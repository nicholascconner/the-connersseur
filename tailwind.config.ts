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
          dark: '#6B0F2A',
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
    },
  },
  plugins: [],
};

export default config;
