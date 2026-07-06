import { styleText } from "node:util"

const probeTimeoutMs = 3_000

const wrongServerMessage = (baseURL: string) =>
  [
    styleText(
      "red",
      `E2E aborted: ${baseURL} is already running without VITE_PLAYWRIGHT_ENABLED=true`,
    ),
    styleText("dim", '(likely "bun run dev")'),
    "",
    styleText("yellow", "Stop that server, then re-run e2e:"),
    styleText("cyan", "  lsof -ti :4000 | xargs kill"),
    styleText("cyan", "  bun run e2e"),
    "",
    styleText("yellow", "Or start the test server first:"),
    styleText("cyan", "  bun tests/prepareAndStartDev.ts"),
  ].join("\n")

export async function assertE2eServerEnv(baseURL: string) {
  const probeUrl = new URL("/api/e2e/server-env", baseURL)

  let response: Response
  try {
    response = await fetch(probeUrl, { signal: AbortSignal.timeout(probeTimeoutMs) })
  } catch {
    // Nothing listening yet — Playwright webServer will start with .env.test.
    return
  }

  if (response.status === 404 || !response.ok) {
    return
  }

  const body = (await response.json()) as { playwrightEnabled?: boolean }
  if (body.playwrightEnabled === true) {
    return
  }

  throw new Error(wrongServerMessage(baseURL))
}
