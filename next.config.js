const { withBlitz } = require("@blitzjs/next")

const s3UploadBucket = process.env.S3_UPLOAD_BUCKET || "trassenscout"
const s3UploadRegion = process.env.S3_UPLOAD_REGION || "eu-central-1"
const s3UploadHostname = `${s3UploadBucket}.s3.${s3UploadRegion}.amazonaws.com`

/**
 * @type {import('@blitzjs/next').BlitzConfig}
 **/
module.exports = withBlitz({
  webpack: (config, { dev, isServer }) => {
    // pdfjs-dist (used by react-pdf) breaks under webpack's default dev
    // `eval-source-map` devtool — modules end up wrapped in `eval()` and the
    // ESM scope confuses `__webpack_require__.r`, producing
    // "Object.defineProperty called on non-object". See:
    // https://github.com/wojtekmaj/react-pdf/issues/2031
    if (dev && !isServer) {
      Object.defineProperty(config, "devtool", {
        get() {
          return "source-map"
        },
        set() {},
      })
    }

    // react-pdf / pdfjs-dist optionally imports `canvas` for Node.js rendering;
    // we only render in the browser, so alias it away to silence the warning.
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    }

    return config
  },
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
    remotePatterns: [
      {
        protocol: "https",
        hostname: s3UploadHostname,
        pathname: "/**",
      },
    ],
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
