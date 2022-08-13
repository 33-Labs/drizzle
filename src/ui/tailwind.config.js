/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'drizzle-green': '#00d588',
        'drizzle-green-dark': '#00a368',
        'drizzle-green-light': '#95e7c1',
        'drizzle-green-ultralight': '#e9faf3', 
        'disabled-gray': '#e2e8f0',
        'disabled-gray-dark': '#cbd5e1',
        'float-green': '#35d9ba'
      },
      fontFamily: {
        'flow': ['sans-serif'],
      },
      boxShadow: {
        'drizzle': '0px 5px 25px -5px rgba(0,0,0,0.2)'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('daisyui')
  ],
}
