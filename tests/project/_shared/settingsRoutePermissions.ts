import { authFile } from "@/tests/_fixtures/auth"
import { authorizationNoise, pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { expectAccessDeniedRedirect } from "@/tests/_utils/pageAssertions"
export { pageNoise }
export const authorizationErrorNoise = authorizationNoise

type SettingsRoutePermissionConfig = {
  suiteName: string
  listPath: string
  listHeading: string
  createPath: string
  createHeading: string
  editHeading: string
  createLinkName: string
}

export const defineSettingsRoutePermissionSuite = ({
  suiteName,
  listPath,
  listHeading,
  createPath,
  createHeading,
  editHeading,
  createLinkName,
}: SettingsRoutePermissionConfig) => {
  test.describe(suiteName, () => {
    test.describe("viewer project members", () => {
      test.use({ storageState: authFile("viewer") })
      test.use({ allowedConsoleErrors: pageNoise })

      test("can read the list without edit controls", async ({ page }) => {
        await page.goto(listPath)

        await expect(page.getByRole("heading", { name: listHeading, exact: true })).toBeVisible({
          timeout: 30_000,
        })
        await expect(page.getByRole("link", { name: createLinkName }).first()).toBeHidden()
        await expect(page.getByRole("link", { name: "Bearbeiten" }).first()).toBeHidden()
        await expect(page.getByRole("button", { name: "Löschen" }).first()).toBeHidden()
      })
    })

    test.describe("viewer project members using direct URLs", () => {
      test.use({ storageState: authFile("viewer") })
      test.use({ allowedConsoleErrors: [...pageNoise, ...authorizationErrorNoise] })

      test("cannot open the create form", async ({ page }) => {
        await page.goto(createPath)

        await expectAccessDeniedRedirect(page)
        await expect(page.getByRole("heading", { name: createHeading })).toBeHidden()
      })

      test("cannot open an edit form", async ({ browser, page }) => {
        const editorContext = await browser.newContext({ storageState: authFile("editor") })
        const editorPage = await editorContext.newPage()
        await editorPage.goto(listPath)
        const editLink = editorPage.getByRole("link", { name: "Bearbeiten", exact: true }).first()
        const hasEditLink = await editLink.isVisible({ timeout: 5_000 }).catch(() => false)
        const editPath = hasEditLink ? await editLink.getAttribute("href") : null
        await editorContext.close()

        if (!editPath) {
          // No items in the list — seed data is missing; skip rather than give a misleading failure.
          test.skip(true, `No "Bearbeiten" link found on ${listPath} — seed data may be missing`)
          return
        }

        expect(editPath).toMatch(new RegExp(`^${listPath}/\\d+/edit$`))

        await page.goto(editPath)

        await expectAccessDeniedRedirect(page)
        await expect(page.getByRole("heading", { name: editHeading })).toBeHidden()
      })
    })

    test.describe("editor project members", () => {
      test.use({ storageState: authFile("editor") })
      test.use({ allowedConsoleErrors: pageNoise })

      test("can open the create form from the list", async ({ page }) => {
        await page.goto(listPath)

        await page.getByRole("link", { name: createLinkName }).first().click()

        await expect(page).toHaveURL(new RegExp(`${createPath}$`))
        await expect(page.getByRole("heading", { name: createHeading, exact: true })).toBeVisible({
          timeout: 30_000,
        })
      })
    })

    test.describe("admin users", () => {
      test.use({ storageState: authFile("admin") })

      test("can read the list without explicit project membership", async ({ page }) => {
        await page.goto(listPath)

        await expect(page.getByRole("heading", { name: listHeading, exact: true })).toBeVisible({
          timeout: 30_000,
        })
      })
    })

    test.describe("users without project membership", () => {
      test.use({ storageState: authFile("noProject") })
      test.use({ allowedConsoleErrors: [...pageNoise, ...authorizationErrorNoise] })

      test("cannot read the list", async ({ page }) => {
        await page.goto(listPath)

        await expectAccessDeniedRedirect(page)
        await expect(page.getByRole("heading", { name: listHeading, exact: true })).toBeHidden()
      })
    })
  })
}
