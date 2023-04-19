// @ts-check
const { withBlitz } = require("@blitzjs/next")

/**
 * @type {import('@blitzjs/next').BlitzConfig}
 **/
const config = {
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: true, // build source maps in production – https://nextjs.org/docs/advanced-features/source-maps
  images: {
    domains: [
      "tinkering.trassenscout.de",
      "staging.trassenscout.de",
      "trassenscout.de",
      "develop--rsv8-lb-wn.netlify.app",
    ], // allow fetching images from those domains – https://nextjs.org/docs/api-reference/next/image#domains
  },
}

module.exports = withBlitz(config)
