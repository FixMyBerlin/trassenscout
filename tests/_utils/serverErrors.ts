import type { Page } from "@playwright/test"

const VITE_MODULE_ABORT = /\/src\/.*\.(?:tsx?|jsx?|css|mjs)(?:\?|$).*net::ERR_ABORTED/i

export function isAcceptableRequestFailure(failure: string) {
  return VITE_MODULE_ABORT.test(failure)
}

export function attachRequestFailureCollector(page: Page) {
  const requestFailures: string[] = []

  page.on("requestfailed", (request) => {
    const failure = `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ""}`
    if (!isAcceptableRequestFailure(failure)) {
      requestFailures.push(failure)
    }
  })

  return requestFailures
}
