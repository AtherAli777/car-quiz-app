// YES - Update this with the brand colors
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from client style guide
        'primary': '#6858E3',
        'soft-blush': '#F9D1CF',
        'coral': {
          400: '#F27491',
          500: '#F27491', 
          600: '#E85D7A',
        },
        'sunset': '#FEE7D8',
        'lavender': {
          400: '#C9C0F6',
          500: '#C9C0F6',
          600: '#B8ABEF',
        },
        'dark-text': '#1D1D1F',
        'muted-gray': '#52525A',
        'bg-light': '#F8F9FB',
        'purple': {
          400: '#6858E3',
          500: '#6858E3',
          600: '#5A47D1',
        }
      },
      fontFamily: {
        'brand': ['Inter', 'Satoshi', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}