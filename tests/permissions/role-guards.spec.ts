import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { expect, test } from "@/tests/_fixtures/test"

test.describe("Role guards", () => {
  test.describe("non-admin users", () => {
    test.use({ storageState: authFile("viewer") })
    test.use({
      allowedConsoleErrors: [
        "webglcontextcreationerror",
        "Failed to initialize WebGL",
        "Failed to fetch RSC payload",
        "Failed to load resource: the server responded with a status of 404 (Not Found)",
      ],
    })

    test("are rejected from admin pages", async ({ page }) => {
      await page.goto("/admin")

      await page.waitForURL("**/dashboard")
      await expect(page).toHaveURL(/\/dashboard$/)
      await expect(page.getByRole("heading", { name: "Meine Projekte" })).toBeVisible({
        timeout: 30_000,
      })
      await expect(page.getByRole("heading", { name: "Trassenscout ADMIN" })).toBeHidden()
    })
  })

  test.describe("users without project membership", () => {
    test.use({ storageState: authFile("noProject") })
    test.use({
      allowedConsoleErrors: [
        "AuthorizationError",
        "You are not authorized to access this",
        "The above error occurred in the <NotFoundErrorBoundary> component",
        "Failed to fetch RSC payload",
        "Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
      ],
    })

    test("are rejected from project pages", async ({ page }) => {
      await page.goto(`/${seedProjects.richProject}/contacts`)

      await expect(page.getByRole("heading", { name: "Ein Fehler ist aufgetreten" })).toBeVisible({
        timeout: 30_000,
      })
      await expect(page.getByRole("heading", { name: "Externe Kontakte" })).toBeHidden()
    })
  })

  test.describe("admin users", () => {
    test.use({ storageState: authFile("admin") })

    test("can access projects without explicit membership", async ({ page }) => {
      await page.goto(`/${seedProjects.richProject}/quality-levels`)

      await expect(
        page.getByRole("heading", { name: "Ausbaustandards", exact: true })
      ).toBeVisible({
        timeout: 30_000,
      })
    })
  })

  test.describe("viewer project members", () => {
    test.use({ storageState: authFile("viewer") })
    test.use({
      allowedConsoleErrors: [
        "webglcontextcreationerror",
        "Failed to initialize WebGL",
        "Failed to fetch RSC payload",
      ],
    })

    test("do not see project edit UI", async ({ page }) => {
      await page.goto(`/${seedProjects.richProject}/quality-levels`)

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
    test.use({
      allowedConsoleErrors: [
        "webglcontextcreationerror",
        "Failed to initialize WebGL",
        "Failed to fetch RSC payload",
      ],
    })

    test("see project edit UI", async ({ page }) => {
      await page.goto(`/${seedProjects.richProject}/quality-levels`)

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
