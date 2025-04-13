/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        luckiest: ['"Luckiest Guy"', 'cursive'],
      },
      colors: {
        'fdd800': '#FDD800',
        'f1b00c': '#F1B00C',
        'e73838': '#E73838',
        'af1616': '#AF1616',
        '1dff38': '#1DFF38',
        '232020': '#232020',
        '2f2828': '#2F2828',
      },
    },
  },
  plugins: [],
};