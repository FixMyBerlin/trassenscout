/**
 * Substrings matched against formatted console/page errors in tests/_fixtures/console-errors.ts.
 * Keep entries specific — broad patterns (e.g. hostnames) hide real regressions.
 *
 * MapTiler / PMTiles: not listed here. E2E runs with VITE_PLAYWRIGHT_ENABLED=true, which uses an empty
 * MapLibre style (mapStyleConfig) and skips remote overlay sources (AllSources).
 */

/** Playwright headless Chromium often cannot create a WebGL context; maps still work enough for smoke tests. */
export const pageNoise = [
  // MapLibre logs when GPU/WebGL is unavailable in CI/headless browsers.
  "webglcontextcreationerror",
  "Failed to initialize WebGL",
  // pg driver warns when parallel requests share one client under dev-server load.
  "Calling client.query() when the client is already executing a query is deprecated",
  "DeprecationWarning: Calling client.query()",
]

/**
 * Public beteiligung survey pages (tests/survey/*).
 * Maps use getSurveyMapStyle + AllSources test-mode stubs — no external tiles.
 */
export const surveyNoise = [...pageNoise]

/**
 * Permission-denied flows that intentionally throw AuthorizationError and render error UI.
 * React also logs component-stack noise from the route error boundary — not app bugs.
 */
export const authorizationNoise = [
  // Thrown by requireProjectRole / requireAdminForRoute and caught by route error boundaries.
  "AuthorizationError",
  "Access forbidden: required project role",
  "You are not authorized to access this",
  "Admin access required",
  "Sie haben keine Berechtigung für diese Seite.",
  // TanStack redirect() in RouteErrorPage surfaces as a Response object in devtools logging.
  "Response",
  // React dev overlay text when an error boundary catches the above.
  "The above error occurred in the <NotFoundErrorBoundary> component",
  "The above error occurred in the <MatchInnerImpl> component",
  // Some forbidden routes still prefetch loader data and log a failed network response.
  "Failed to load resource: the server responded with a status of 500",
]

/**
 * Upload list/detail flows and project pages that open upload previews.
 * MapTiler is handled via getMapStyle test mode — not silenced here.
 */
export const uploadPageNoise = [
  ...pageNoise,
  // Seed/factory uploads use placeholder externalUrl (e.g. example.com) — PDF fetch 404s are expected.
  "Failed to load resource: the server responded with a status of 404 (Not Found)",
  // react-pdf / MapLibre AJAX wrapper when the placeholder PDF URL is unreachable.
  "AJAXError: Failed to fetch",
]
