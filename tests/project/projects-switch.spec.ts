import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { expect, test } from "@/tests/_fixtures/test"

const projectSlug = seedProjects.richProject
const secondaryProjectSlug = "rs3000"

test.describe("Projects switch", () => {
  test.use({ storageState: authFile("viewer") })

  test("switches project via searchable combobox", async ({ page }) => {
    await page.goto(`/${projectSlug}`)

    const projectSwitch = page.getByRole("button", { name: /Projektwechsel/ })
    await expect(projectSwitch).toBeVisible()
    await expect(projectSwitch).toContainText("RS23")

    await projectSwitch.click()
    await page.getByPlaceholder("Suchen").fill(secondaryProjectSlug.toUpperCase())
    await page.getByRole("option", { name: secondaryProjectSlug.toUpperCase() }).click()

    await expect(page).toHaveURL(new RegExp(`/${secondaryProjectSlug}$`))
  })

  test('navigates to dashboard via "Meine Projekte"', async ({ page }) => {
    await page.goto(`/${projectSlug}`)

    const projectSwitch = page.getByRole("button", { name: /Projektwechsel/ })
    await projectSwitch.click()
    await page.getByPlaceholder("Suchen").fill("Meine Projekte")
    await page.getByRole("option", { name: "Meine Projekte" }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByText("Meine Projekte", { exact: true })).toBeVisible()
  })
})
