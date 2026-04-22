import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { expect, test } from "@/tests/_fixtures/test"

const projectSlug = seedProjects.richProject
const qualityLevelsPath = `/${projectSlug}/quality-levels`
const newQualityLevelPath = `${qualityLevelsPath}/new`

const pageNoise = [
  "webglcontextcreationerror",
  "Failed to initialize WebGL",
  "Failed to fetch RSC payload",
]
const authorizationErrorNoise = [
  "AuthorizationError",
  "Access forbidden: required project role",
  "You are not authorized to access this",
  "The above error occurred in the <NotFoundErrorBoundary> component",
  "Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
]

test.describe("Quality levels permissions", () => {
  test.describe("viewer project members", () => {
    test.use({ storageState: authFile("viewer") })
    test.use({ allowedConsoleErrors: pageNoise })

    test("can read the list without edit controls", async ({ page }) => {
      await page.goto(qualityLevelsPath)

      await expect(page.getByRole("heading", { name: "Ausbaustandards", exact: true })).toBeVisible(
        {
          timeout: 30_000,
        },
      )
      await expect(page.getByRole("link", { name: "Neuer Ausbaustandard" })).toBeHidden()
      await expect(page.getByRole("link", { name: "Bearbeiten" }).first()).toBeHidden()
      await expect(page.getByRole("button", { name: "Löschen" }).first()).toBeHidden()
    })
  })

  test.describe("viewer project members using direct URLs", () => {
    test.use({ storageState: authFile("viewer") })
    test.use({ allowedConsoleErrors: [...pageNoise, ...authorizationErrorNoise] })

    test("cannot open the create form", async ({ page }) => {
      await page.goto(newQualityLevelPath)

      await expect(page.getByRole("heading", { name: "Ein Fehler ist aufgetreten" })).toBeVisible({
        timeout: 30_000,
      })
      await expect(page.getByRole("heading", { name: "Ausbaustandard hinzufügen" })).toBeHidden()
    })

    test("cannot open an edit form", async ({ browser, page }) => {
      const editorContext = await browser.newContext({ storageState: authFile("editor") })
      const editorPage = await editorContext.newPage()
      await editorPage.goto(qualityLevelsPath)
      const editPath = await editorPage
        .getByRole("link", { name: "Bearbeiten" })
        .first()
        .getAttribute("href")
      await editorContext.close()

      expect(editPath).toMatch(new RegExp(`^/${projectSlug}/quality-levels/\\d+/edit$`))

      await page.goto(editPath!)

      await expect(page.getByRole("heading", { name: "Ein Fehler ist aufgetreten" })).toBeVisible({
        timeout: 30_000,
      })
      await expect(page.getByRole("heading", { name: "Ausbaustandard bearbeiten" })).toBeHidden()
    })
  })

  test.describe("editor project members", () => {
    test.use({ storageState: authFile("editor") })
    test.use({ allowedConsoleErrors: pageNoise })

    test("can open the create form from the list", async ({ page }) => {
      await page.goto(qualityLevelsPath)

      await page.getByRole("link", { name: "Neuer Ausbaustandard" }).click()

      await expect(page).toHaveURL(new RegExp(`${newQualityLevelPath}$`))
      await expect(
        page.getByRole("heading", { name: "Ausbaustandard hinzufügen", exact: true }),
      ).toBeVisible({
        timeout: 30_000,
      })
    })
  })

  test.describe("admin users", () => {
    test.use({ storageState: authFile("admin") })

    test("can read the list without explicit project membership", async ({ page }) => {
      await page.goto(qualityLevelsPath)

      await expect(page.getByRole("heading", { name: "Ausbaustandards", exact: true })).toBeVisible(
        {
          timeout: 30_000,
        },
      )
    })
  })

  test.describe("users without project membership", () => {
    test.use({ storageState: authFile("noProject") })
    test.use({ allowedConsoleErrors: [...pageNoise, ...authorizationErrorNoise] })

    test("cannot read the list", async ({ page }) => {
      await page.goto(qualityLevelsPath)

      await expect(page.getByRole("heading", { name: "Ein Fehler ist aufgetreten" })).toBeVisible({
        timeout: 30_000,
      })
      await expect(page.getByRole("heading", { name: "Ausbaustandards", exact: true })).toBeHidden()
    })
  })
})
