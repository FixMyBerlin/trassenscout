/** @type {import('tailwindcss').Config} */
/* eslint-disable global-require */
//  @type {import('tailwindcss').Config}
const colors = require("tailwindcss/colors")

module.exports = {
  content: ["src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          // Tell the plugin to not add any classes to anchor tags
          // since we always use the Link component which is styled already.
          css: { a: false },
        },
      },
    },
    colors: {
      white: colors.white,
      black: colors.black,
      gray: colors.gray,
      purple: colors.purple, // super admin color
      // primary
      blue: {
        50: "#DFE9F7",
        100: "#B6CEEC",
        200: "#8EB2E1",
        300: "#6697D7",
        400: "#3D7BCC",
        500: "#2C62A9", // default
        600: "#224B81",
        700: "#173459",
        800: "#0D1C31",
        900: "#020508",
      },
      // secondary
      yellow: {
        50: "#FFFBF0",
        100: "#FDEEBF",
        200: "#FBE08D",
        300: "#FAD35C",
        400: "#F8C62B",
        500: "#EAB308", // default
        600: "#B68C06",
        700: "#856605",
        800: "#544003",
        900: "#231A01",
      },
      // pink (Beteiligung)
      pink: {
        50: "#FFE5F3",
        100: "#FFB3DC",
        200: "#FF80C5",
        300: "#FF4CAE",
        400: "#FF1A97",
        500: "#E5007D", // default
        600: "#B20061",
        700: "#800046",
        800: "#4D002A",
        900: "#1A000E",
      },
      // error
      red: {
        50: "#FFF1F2",
        100: "#FFE4E6",
        200: "#FECDD3",
        300: "#FDA4AF",
        400: "#FB7185",
        500: "#F43F5E", // default
        600: "#E11D48",
        700: "#BE123C",
        800: "#9F1239",
        900: "#9F1239",
      },
      // success
      green: {
        50: "#ECFDF5",
        100: "#D1FAE5",
        200: "#A7F3D0",
        300: "#6EE7B7",
        400: "#34D399",
        500: "#10B981", // default
        600: "#059669",
        700: "#047857",
        800: "#065F46",
        900: "#064E3B",
      },
    },
    fontFamily: {
      sans: ["OverpassVariable", "sans-serif"],
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
}
