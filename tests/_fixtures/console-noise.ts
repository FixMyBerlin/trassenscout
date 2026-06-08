export const pageNoise = [
  "webglcontextcreationerror",
  "Failed to initialize WebGL",
  "Failed to fetch RSC payload",
]

// Known errors specific to survey (beteiligung) pages.
// "Element type is invalid" is a pre-existing React hydration warning emitted by the
// MapLibre / react-map-gl component tree during SSR→CSR reconciliation; it does not
// prevent the survey from rendering or submitting.
// "Cannot submit: surveyResponseId is null" is expected during multi-feedback flows
// when the response ID is momentarily reset between successive submissions.
export const surveyNoise = [
  ...pageNoise,
  "Cannot submit: surveyResponseId is null",
]

export const authorizationNoise = [
  "AuthorizationError",
  "Access forbidden: required project role",
  "You are not authorized to access this",
  "The above error occurred in the <NotFoundErrorBoundary> component",
  "Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
]
