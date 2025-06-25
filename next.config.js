const { withBlitz } = require("@blitzjs/next")

/**
 * @type {import('@blitzjs/next').BlitzConfig}
 **/
module.exports = withBlitz({
  // StrictMode: Should be default, but just in case…
  // Docs: https://nextjs.org/docs/app/api-reference/next-config-js/reactStrictMode
  // See also: https://github.com/facebook/react/issues/29130
  reactStrictMode: true,
  experimental: {
    // https://nextjs.org/docs/app/building-your-application/configuring/typescript#statically-typed-links
    typedRoutes: true,
    instrumentationHook: true,
  },
  swcMinify: true,
  productionBrowserSourceMaps: true, // build source maps in production – https://nextjs.org/docs/advanced-features/source-maps
  images: {
    domains: [
      "tinkering.trassenscout.de",
      "staging.trassenscout.de",
      "trassenscout.de",
      "radschnellweg8-lb-wn.de",
      "develop--frm-7-landingpage.netlify.app",
      "radschnellweg-frm7.de",
      // tbd
      "www.oberhavel.de",
    ], // allow fetching images from those domains – https://nextjs.org/docs/api-reference/next/image#domains
  },
})
