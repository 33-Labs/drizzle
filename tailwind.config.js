/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'drizzle-green': '#68EE8E',
        'drizzle-green-dark': '#58D27D'
      },
      fontFamily: {
        'flow': ['acumin-pro', 'sans-serif'],
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
