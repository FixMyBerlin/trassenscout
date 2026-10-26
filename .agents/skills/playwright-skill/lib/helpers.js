// playwright-helpers.js
// Small shared utilities for the ad-hoc runner (run.js)

const path = require("path")

/**
 * Parse extra HTTP headers from environment variables.
 * Supports two formats:
 * - PW_HEADER_NAME + PW_HEADER_VALUE: Single header (simple, common case)
 * - PW_EXTRA_HEADERS: JSON object for multiple headers (advanced)
 * Single header format takes precedence if both are set.
 * @returns {Object|null} Headers object or null if none configured
 */
function getExtraHeadersFromEnv() {
  const headerName = process.env.PW_HEADER_NAME
  const headerValue = process.env.PW_HEADER_VALUE

  if (headerName && headerValue) {
    return { [headerName]: headerValue }
  }

  const headersJson = process.env.PW_EXTRA_HEADERS
  if (headersJson) {
    try {
      const parsed = JSON.parse(headersJson)
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        return parsed
      }
      console.warn("PW_EXTRA_HEADERS must be a JSON object, ignoring...")
    } catch (e) {
      console.warn("Failed to parse PW_EXTRA_HEADERS as JSON:", e.message)
    }
  }

  return null
}

/**
 * Take screenshot with timestamp. Written to the caller's cwd (or to the
 * directory of `name` if it is a path), never into the skill folder.
 * @param {Object} page - Playwright page
 * @param {string} name - Screenshot name or path prefix
 * @param {Object} options - Screenshot options
 */
async function takeScreenshot(page, name, options = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  // run.js chdirs into the skill folder; PW_CALLER_CWD is the caller's original cwd.
  // Relative names resolve against the caller's project, absolute names are kept.
  const callerCwd = process.env.PW_CALLER_CWD || process.cwd()
  const filename = path.resolve(callerCwd, `${name}-${timestamp}.png`)

  await page.screenshot({
    path: filename,
    fullPage: options.fullPage !== false,
    ...options,
  })

  console.log(`Screenshot saved: ${filename}`)
  return filename
}

/**
 * Create browser context with common settings
 * @param {Object} browser - Browser instance
 * @param {Object} options - Context options
 */
async function createContext(browser, options = {}) {
  const envHeaders = getExtraHeadersFromEnv()

  // Merge environment headers with any passed in options
  const mergedHeaders = {
    ...envHeaders,
    ...options.extraHTTPHeaders,
  }

  const defaultOptions = {
    viewport: { width: 1280, height: 720 },
    userAgent: options.mobile
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1"
      : undefined,
    permissions: options.permissions || [],
    geolocation: options.geolocation,
    locale: options.locale || "en-US",
    timezoneId: options.timezoneId || "America/New_York",
    // Only include extraHTTPHeaders if we have any
    ...(Object.keys(mergedHeaders).length > 0 && { extraHTTPHeaders: mergedHeaders }),
  }

  return await browser.newContext({ ...defaultOptions, ...options })
}

/**
 * Detect running dev servers on common ports
 * @param {Array<number>} customPorts - Additional ports to check
 * @returns {Promise<Array>} Array of detected server URLs
 */
async function detectDevServers(customPorts = []) {
  const http = require("http")

  // Common dev server ports
  const commonPorts = [3000, 3001, 3002, 5173, 8080, 8000, 4200, 5000, 9000, 1234]
  const allPorts = [...new Set([...commonPorts, ...customPorts])]

  const detectedServers = []

  console.log("🔍 Checking for running dev servers...")

  for (const port of allPorts) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: "localhost",
            port: port,
            path: "/",
            method: "HEAD",
            timeout: 500,
          },
          (res) => {
            if (res.statusCode < 500) {
              detectedServers.push(`http://localhost:${port}`)
              console.log(`  ✅ Found server on port ${port}`)
            }
            resolve()
          },
        )

        req.on("error", () => resolve())
        req.on("timeout", () => {
          req.destroy()
          resolve()
        })

        req.end()
      })
    } catch (e) {
      // Port not available, continue
    }
  }

  if (detectedServers.length === 0) {
    console.log("  ❌ No dev servers detected")
  }

  return detectedServers
}

module.exports = {
  takeScreenshot,
  createContext,
  detectDevServers,
  getExtraHeadersFromEnv,
}
