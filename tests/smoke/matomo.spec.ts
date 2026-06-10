import { expect, test } from "@/tests/_fixtures/test"

test.describe("Matomo tracking", () => {
  test("logs config to the console in dev/staging", async ({ page }) => {
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

    await expect.poll(() => matomoConsoleLogs.length).toBeGreaterThanOrEqual(1)
    await expect(
      matomoConsoleLogs.some((line) => line.includes("https://s.fixmycity.de/matomo.php")),
    ).toBe(true)

    await page.getByRole("link", { name: "Datenschutz" }).click()
    await expect(
      page.getByRole("heading", { name: "Datenschutzerklärung", exact: true }),
    ).toBeVisible()
  })
})
