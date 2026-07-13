import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { authorizationNoise, pageNoise, uploadPageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { expectAccessDeniedRedirect, loginUrl } from "@/tests/_utils/pageAssertions"

const projectSlug = seedProjects.richProject
const projectOverviewPath = `/${projectSlug}`
const uploadsPath = `/${projectSlug}/uploads`

test.describe("Project core route permissions", () => {
  test.describe("logged-out users", () => {
    test.use({
      allowedConsoleErrors: [
        "Failed to fetch RSC payload",
        "Failed to load resource: the server responded with a status of 404 (Not Found)",
      ],
    })

    test("are redirected from project overview to login", async ({ page }) => {
      await page.goto(projectOverviewPath)

      await expect(page).toHaveURL(loginUrl, { timeout: 30_000 })
    })

    test("are redirected from uploads to login", async ({ page }) => {
      await page.goto(uploadsPath)

      await expect(page).toHaveURL(loginUrl, { timeout: 30_000 })
    })
  })

  test.describe("viewer project members", () => {
    test.use({ storageState: authFile("viewer") })
    test.use({ allowedConsoleErrors: uploadPageNoise })

    test("can access project overview", async ({ page }) => {
      await page.goto(projectOverviewPath)

      await expect(page.getByRole("heading", { name: "RS23", exact: true })).toBeVisible({
        timeout: 30_000,
      })
    })

    test("can access uploads and see upload dropzone", async ({ page }) => {
      await page.goto(uploadsPath)

      await expect(page.getByRole("heading", { name: "Dokumente", exact: true })).toBeVisible({
        timeout: 30_000,
      })
      await expect(page.getByText("Dateien hierher ziehen und ablegen")).toBeVisible({
        timeout: 30_000,
      })
    })
  })

  test.describe("editor project members", () => {
    test.use({ storageState: authFile("editor") })
    test.use({ allowedConsoleErrors: uploadPageNoise })

    test("see upload editing UI on uploads page", async ({ page }) => {
      await page.goto(uploadsPath)

      await expect(page.getByRole("heading", { name: "Dokumente", exact: true })).toBeVisible({
        timeout: 30_000,
      })
      await expect(page.getByText("Dateien hierher ziehen und ablegen")).toBeVisible({
        timeout: 30_000,
      })
    })
  })

  test.describe("users without project membership", () => {
    test.use({ storageState: authFile("noProject") })
    test.use({ allowedConsoleErrors: [...pageNoise, ...authorizationNoise] })

    test("cannot access project overview", async ({ page }) => {
      await page.goto(projectOverviewPath)
      await expectAccessDeniedRedirect(page)
    })

    test("cannot access uploads", async ({ page }) => {
      await page.goto(uploadsPath)
      await expectAccessDeniedRedirect(page)
    })
  })

  test.describe("admin users", () => {
    test.use({ storageState: authFile("admin") })
    test.use({ allowedConsoleErrors: uploadPageNoise })

    test("can access uploads without explicit project membership", async ({ page }) => {
      await page.goto(uploadsPath)

      await expect(page.getByRole("heading", { name: "Dokumente", exact: true })).toBeVisible({
        timeout: 30_000,
      })
    })
  })
})
