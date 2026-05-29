import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"

const projectSlug = seedProjects.richProject
const listPath = `/${projectSlug}/uploads`

test.describe("Uploads read flow", () => {
  test.use({ storageState: authFile("viewer") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("viewer can open and close upload detail modal", async ({ page }) => {
    await page.goto(listPath)
    await expect(page.getByRole("heading", { name: "Dokumente", exact: true })).toBeVisible({
      timeout: 30_000,
    })

    const previewButton = page.locator("tbody tr td button[title]").first()
    await expect(previewButton).toBeVisible({ timeout: 30_000 })

    const uploadTitle = await previewButton.getAttribute("title")
    await previewButton.click()

    await expect(page.getByRole("button", { name: "Schließen" })).toBeVisible({ timeout: 30_000 })

    if (uploadTitle && uploadTitle.trim().length > 0) {
      await expect(page.getByRole("heading", { name: uploadTitle, exact: true })).toBeVisible({
        timeout: 30_000,
      })
    }

    await page.getByRole("button", { name: "Schließen" }).click()
    await expect(page.getByRole("button", { name: "Schließen" })).toHaveCount(0)
    await expect(page).toHaveURL(new RegExp(`/${projectSlug}/uploads$`))
  })
})
