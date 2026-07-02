import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"

const projectSlug = seedProjects.richProject
const listPath = `/${projectSlug}/project-records`

test.describe("Project records read flow", () => {
  test.use({ storageState: authFile("viewer") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("viewer can open a record from list and return back", async ({ page }) => {
    await page.goto(listPath)
    await expect(page.getByRole("heading", { name: "Projektprotokoll", exact: true })).toBeVisible({
      timeout: 30_000,
    })

    const zeroCase = page.getByText("Es wurden noch keine Protokolleinträge eingetragen.")
    const firstRecordLink = page.locator("tbody tr td a").first()

    await expect
      .poll(
        async () => (await page.locator("tbody tr td a").count()) + (await zeroCase.count()),
        { timeout: 30_000 },
      )
      .toBeGreaterThan(0)

    if ((await page.locator("tbody tr td a").count()) === 0) {
      await expect(zeroCase).toBeVisible({ timeout: 30_000 })
      return
    }

    await expect(firstRecordLink).toBeVisible({ timeout: 30_000 })

    const firstRecordTitle = (await firstRecordLink.innerText()).trim()
    await firstRecordLink.click()

    await expect(page).toHaveURL(new RegExp(`/${projectSlug}/project-records/\\d+$`))
    await expect(page.getByRole("heading", { name: firstRecordTitle, exact: true })).toBeVisible({
      timeout: 30_000,
    })

    await page.goBack()

    await expect(page).toHaveURL(new RegExp(`/${projectSlug}/project-records$`))
    await expect(page.getByRole("heading", { name: "Projektprotokoll", exact: true })).toBeVisible({
      timeout: 30_000,
    })
  })
})
