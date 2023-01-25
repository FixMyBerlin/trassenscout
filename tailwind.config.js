/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "rsv-pink": "#e6007d",
        "rsv-blau": "#0f65af",
        "rsv-ochre": "#eab308",
        hellgrau: "#F9FAFB",
      },
      backgroundImage: {
        'dashed-line':
          'repeating-linear-gradient(to right, #d9d9d9, #d9d9d9 10px, transparent 10px, transparent 13px)',
      },
      typography: {
        DEFAULT: {
          // Tell the plugin to not add any classes to anchor tags
          // since we always use the Link component which is styled already.
          css: { a: false },
        },
      },
    },
    fontFamily: {
      sans: ["OverpassVariable", "sans-serif"],
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
  },
  plugins: [require("@tailwindcss/typography"), require('@tailwindcss/line-clamp'), require("@tailwindcss/forms")],
}
