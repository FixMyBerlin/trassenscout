import { expect, test } from "@/tests/_fixtures/test"

test.describe("Matomo tracking", () => {
  test("logs config and per-pageview data to the console in dev/staging", async ({ page }) => {
    const matomoConsoleLogs: string[] = []

    page.on("console", (message) => {
      const text = message.text()
      if (text.startsWith("[Matomo]")) {
        matomoConsoleLogs.push(text)
      }
    })

    await page.goto("/")
    await expect(
      page.getByRole("heading", { name: "Trassenscout findet Wege", exact: true }),
    ).toBeVisible()

    // Init script logs the config (tracker URL + site id).
    await expect
      .poll(() =>
        matomoConsoleLogs.some((line) => line.includes("https://s.fixmycity.de/matomo.php")),
      )
      .toBe(true)

    // The initial render is tracked as a pageview.
    await expect
      .poll(() => matomoConsoleLogs.some((line) => line.startsWith("[Matomo] pageview:")))
      .toBe(true)

    await page.getByRole("link", { name: "Datenschutz" }).click()
    await expect(
      page.getByRole("heading", { name: "Datenschutzerklärung", exact: true }),
    ).toBeVisible()

    // Client-side navigation is tracked with the navigated URL.
    await expect
      .poll(() =>
        matomoConsoleLogs.some(
          (line) => line.startsWith("[Matomo] pageview:") && line.includes("/datenschutz"),
        ),
      )
      .toBe(true)

    // _paq accumulates the tracking calls that matomo.js consumes in production.
    const trackPageViewCount = await page.evaluate(() => {
      const paq =
        (window as unknown as { _paq?: Array<Array<string | number | boolean>> })._paq ?? []
      return paq.filter((call) => call[0] === "trackPageView").length
    })
    expect(trackPageViewCount).toBeGreaterThanOrEqual(2)
  })
})
