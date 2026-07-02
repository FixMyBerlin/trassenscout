import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { authorizationNoise, pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { expectErrorPage } from "@/tests/_utils/pageAssertions"

const projectSlug = seedProjects.richProject
const qualityLevelsPath = `/${projectSlug}/quality-levels`
const contactsPath = `/${projectSlug}/contacts`

const redirectNoise = [
  ...pageNoise,
  "Failed to load resource: the server responded with a status of 404 (Not Found)",
]

test.describe("Role guards", () => {
  test.describe("non-admin users", () => {
    test.use({ storageState: authFile("viewer") })
    test.use({ allowedConsoleErrors: redirectNoise })

    test("are rejected from admin pages", async ({ page }) => {
      await page.goto("/admin")

      await page.waitForURL("**/dashboard")
      await expect(page).toHaveURL(/\/dashboard$/)
      await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({
        timeout: 30_000,
      })
      await expect(page.getByRole("heading", { name: "Trassenscout ADMIN" })).toBeHidden()
    })
  })

  test.describe("users without project membership", () => {
    test.use({ storageState: authFile("noProject") })
    test.use({
      allowedConsoleErrors: [...pageNoise, ...authorizationNoise],
    })

    test("are rejected from project pages", async ({ page }) => {
      await page.goto(contactsPath)
      await expectErrorPage(page)
      await expect(page.getByRole("heading", { name: "Externe Kontakte" })).toBeHidden()
    })
  })

  test.describe("admin users", () => {
    test.use({ storageState: authFile("admin") })
    test.use({ allowedConsoleErrors: pageNoise })

    test("can access projects without explicit membership", async ({ page }) => {
      await page.goto(qualityLevelsPath)

      await expect(
        page.getByRole("heading", { name: "Ausbaustandards", exact: true })
      ).toBeVisible({
        timeout: 30_000,
      })
    })
  })

  test.describe("viewer project members", () => {
    test.use({ storageState: authFile("viewer") })
    test.use({ allowedConsoleErrors: pageNoise })

    test("do not see project edit UI", async ({ page }) => {
      await page.goto(qualityLevelsPath)

      await expect(
        page.getByRole("heading", { name: "Ausbaustandards", exact: true })
      ).toBeVisible({
        timeout: 30_000,
      })
      await expect(
        page.getByRole("link", { name: "Neuer Ausbaustandard", exact: true })
      ).toBeHidden()
    })
  })

  test.describe("editor project members", () => {
    test.use({ storageState: authFile("editor") })
    test.use({ allowedConsoleErrors: pageNoise })

    test("see project edit UI", async ({ page }) => {
      await page.goto(qualityLevelsPath)

      await expect(
        page.getByRole("heading", { name: "Ausbaustandards", exact: true })
      ).toBeVisible({
        timeout: 30_000,
      })
      await expect(
        page.getByRole("link", { name: "Neuer Ausbaustandard", exact: true })
      ).toBeVisible()
    })
  })
})
