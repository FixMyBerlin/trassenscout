import { expect, test } from "@playwright/test"

test.describe("Static Pages", () => {
  test("Check marketing homepage – title", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveTitle(/Trassenscout/)
    await expect(page.locator("h1")).toContainText(/Trassenscout findet Wege/)

    // Does not work locally since we set `noindex` on all pages
    // const noindexMetaTag = page.locator('meta[name="robots"][content="noindex"]')
    // await expect(noindexMetaTag).toHaveCount(0)
  })

  test("Check privacy page – title", async ({ page }) => {
    await page.goto("/datenschutz")

    await expect(page).toHaveTitle(/Datenschutzerklärung/)
    await expect(page.locator("h1")).toContainText(/Datenschutzerklärung/)

    const noindexMetaTag = page.locator('meta[name="robots"][content="noindex"]')
    await expect(noindexMetaTag).toHaveCount(1)
  })

  test("Check contact page – title", async ({ page }) => {
    await page.goto("/kontakt")

    await expect(page).toHaveTitle(/Kontakt/)
    await expect(page.locator("h1")).toContainText(/Kontakt/)

    const noindexMetaTag = page.locator('meta[name="robots"][content="noindex"]')
    await expect(noindexMetaTag).toHaveCount(1)
  })
})
