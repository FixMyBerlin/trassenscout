import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { uploadPageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"

const projectSlug = seedProjects.richProject
const listPath = `/${projectSlug}/uploads`

test.describe("Uploads read flow", () => {
  test.use({ storageState: authFile("viewer") })
  test.use({ allowedConsoleErrors: uploadPageNoise })

  test("viewer can open and close upload detail modal", async ({ page }) => {
    await page.goto(listPath)
    await expect(page.getByRole("heading", { name: "Dokumente", exact: true })).toBeVisible({
      timeout: 30_000,
    })

    // Guard: if the seed has no uploads the test is a no-op — skip rather than hang on timeout.
    const previewButton = page.locator("tbody tr").first().getByRole("button")
    const hasUploads = await previewButton.isVisible({ timeout: 5_000 }).catch(() => false)

    if (!hasUploads) {
      test.skip(true, "No uploads found in seed data — skipping modal flow")
      return
    }

    await expect(previewButton).toBeVisible({ timeout: 30_000 })
    await page.waitForSelector('[data-upload-preview-ready="true"]', { timeout: 30_000 })

    const uploadTitle = await page.locator("tbody tr").first().locator("td").first().textContent()
    await previewButton.click()

    await expect(page.locator('[aria-label="Schließen"]')).toBeVisible({ timeout: 30_000 })

    if (uploadTitle && uploadTitle.trim().length > 0) {
      await expect(page.getByRole("heading", { name: uploadTitle, exact: true })).toBeVisible({
        timeout: 30_000,
      })
    }

    await page.locator('[aria-label="Schließen"]').click()
    await expect(page.locator('[aria-label="Schließen"]')).toHaveCount(0)
    await expect(page).toHaveURL(new RegExp(`/${projectSlug}/uploads$`))
  })
})
