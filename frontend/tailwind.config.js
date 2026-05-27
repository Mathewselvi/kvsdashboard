/** @type {import('tailwindcss').Config} - Force reload */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        genesis: {
          primary: '#6366F1',
          primaryHover: '#4F46E5',
          secondary: '#20970B',
          neutral: '#9C9C9C',
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          textMain: '#0A0A0A',
          textSub: '#6B6B6B',
          border: '#E8E8EC',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        brand: {
          DEFAULT: '#6366F1', // Overriding old brand color to match primary
          light: '#818CF8',
          dark: '#4F46E5',
        },
      },
      fontFamily: {
        display: ['General Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'genesis': '0 8px 30px rgba(0,0,0,0.08)',
        'btn': '0 4px 12px rgba(99,102,241,0.35)',
      }
    },
  },
  plugins: [],
}
