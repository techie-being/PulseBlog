/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
            'purple': '#8B46FF',
            'grey': '#F3F3F3',
            'dark-grey': '#6B6B6B',
        },
        fontFamily: {
          inter: ["'Inter'", "sans-serif"],
          gelasio: ["'Gelasio'", "serif"]
        }
      },
    },
    plugins: [],
  }