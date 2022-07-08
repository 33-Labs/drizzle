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
        'drizzle-green': '#68ee8e',
        'drizzle-green-dark': '#58d27d',
        'disabled-gray': '#e2e8f0',
        'disabled-gray-dark': '#cbd5e1'
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
