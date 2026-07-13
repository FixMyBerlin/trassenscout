import { authFile } from "@/tests/_fixtures/auth"
import { expect, test } from "@/tests/_fixtures/test"
import { waitForFormReady } from "@/tests/_utils/waitForFormReady"

type SettingsRouteCrudConfig = {
  suiteName: string
  listPath: string
  listHeading: string
  createLinkName: string
  createHeading: string
  editHeading: string
  slugLabel: string
  titleLabel: string
  createSubmitText: string
  editSubmitText: string
}

export const defineSettingsRouteCrudSuite = ({
  suiteName,
  listPath,
  listHeading,
  createLinkName,
  createHeading,
  editHeading,
  slugLabel,
  titleLabel,
  createSubmitText,
  editSubmitText,
}: SettingsRouteCrudConfig) => {
  test.describe(suiteName, () => {
    test.describe.configure({ mode: "serial" })
    test.use({ storageState: authFile("editor") })

    test("editor can create and update an item with persisted list refresh", async ({ page }) => {
      test.setTimeout(120_000)

      const slug = `e2e-${Date.now()}`
      const initialTitle = `E2E ${slug} initial`
      const updatedTitle = `E2E ${slug} updated`

      await page.goto(listPath)
      await expect(page.getByRole("heading", { name: listHeading, exact: true })).toBeVisible({
        timeout: 30_000,
      })

      await page.getByRole("link", { name: createLinkName, exact: true }).first().click()
      await expect(page.getByRole("heading", { name: createHeading, exact: true })).toBeVisible({
        timeout: 30_000,
      })

      await waitForFormReady(page, [slugLabel, titleLabel])

      await page.getByLabel(slugLabel, { exact: true }).fill(slug)
      await page.getByLabel(titleLabel, { exact: true }).fill(initialTitle)
      const orderField = page.getByLabel("Reihenfolge", { exact: true })
      if (await orderField.count()) {
        await orderField.fill("999")
      }

      await page.getByRole("button", { name: createSubmitText, exact: true }).click()

      await expect(page).toHaveURL(new RegExp(`${listPath}(\\?.*)?$`), { timeout: 30_000 })

      const initialRow = page.locator("tbody tr", { hasText: initialTitle }).first()
      await expect(initialRow).toBeVisible({ timeout: 30_000 })

      await page.reload()
      await expect(page.getByRole("heading", { name: listHeading, exact: true })).toBeVisible({
        timeout: 30_000,
      })
      await expect(page.locator("tbody tr", { hasText: initialTitle }).first()).toBeVisible({
        timeout: 30_000,
      })

      await initialRow.getByRole("link", { name: "Bearbeiten", exact: true }).click()
      await expect(page.getByRole("heading", { name: editHeading, exact: true })).toBeVisible({
        timeout: 30_000,
      })

      await waitForFormReady(page, [titleLabel])
      await page.getByLabel(titleLabel, { exact: true }).fill(updatedTitle)
      await page.getByRole("button", { name: editSubmitText, exact: true }).click()

      await expect(page).toHaveURL(new RegExp(`${listPath}(\\?.*)?$`), { timeout: 30_000 })
      await expect(page.locator("tbody tr", { hasText: updatedTitle }).first()).toBeVisible({
        timeout: 30_000,
      })

      await page.reload()
      await expect(page.getByRole("heading", { name: listHeading, exact: true })).toBeVisible({
        timeout: 30_000,
      })
      await expect(page.locator("tbody tr", { hasText: updatedTitle }).first()).toBeVisible({
        timeout: 30_000,
      })

      // Delete — also acts as self-cleanup so the item doesn't accumulate across runs.
      const updatedRow = page.locator("tbody tr", { hasText: updatedTitle }).first()
      const deleteButton = updatedRow.getByRole("button", { name: "Löschen", exact: true })
      await deleteButton.scrollIntoViewIfNeeded()
      await page.evaluate(() => {
        window.confirm = () => true
      })
      await expect(async () => {
        await deleteButton.click()
        await expect(page.locator("tbody tr", { hasText: updatedTitle })).toHaveCount(0, {
          timeout: 2_000,
        })
      }).toPass({ timeout: 30_000 })

      await page.reload()
      await expect(page.getByRole("heading", { name: listHeading, exact: true })).toBeVisible({
        timeout: 30_000,
      })
      await expect(page.locator("tbody tr", { hasText: updatedTitle })).toHaveCount(0)
    })
  })
}
