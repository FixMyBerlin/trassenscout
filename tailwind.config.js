const colors = require("tailwindcss/colors")

// plugin configuration in global.css is not possible in v4 yet
// all other tw theme config should happen in css!

/** @type {import('tailwindcss').Config} */
module.exports = {
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
  },
}
