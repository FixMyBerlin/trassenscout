import type { Locator, Page } from "@playwright/test"
import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { expect, test } from "@/tests/_fixtures/test"

const projectSlug = seedProjects.richProject
const secondaryProjectSlug = "rs3000"

async function openProjectSwitchSearch(page: Page): Promise<{
  projectSwitch: Locator
  projectSwitchRoot: Locator
  searchInput: Locator
}> {
  const projectSwitch = page.getByRole("button", { name: /Projektwechsel/ })
  await expect(projectSwitch).toBeVisible()

  const projectSwitchRoot = projectSwitch.locator("..")
  const searchInput = projectSwitchRoot.getByPlaceholder("Suchen")

  // Retry until the click lands: the switch button is dead before hydration.
  // Only click while the dropdown is closed — it is a toggle.
  await expect(async () => {
    if (!(await searchInput.isVisible())) {
      await projectSwitch.click()
    }
    await expect(searchInput).toBeVisible({ timeout: 2_000 })
  }).toPass({ timeout: 30_000 })

  return { projectSwitch, projectSwitchRoot, searchInput }
}

test.describe("Projects switch", () => {
  test.use({ storageState: authFile("viewer") })

  test("switches project via searchable combobox", async ({ page }) => {
    await page.goto(`/${projectSlug}`)

    const { projectSwitch, projectSwitchRoot, searchInput } = await openProjectSwitchSearch(page)
    await expect(projectSwitch).toContainText("RS23")
    await searchInput.fill(secondaryProjectSlug.toUpperCase())
    await projectSwitchRoot
      .getByRole("option", { name: secondaryProjectSlug.toUpperCase() })
      .click()

    await expect(page).toHaveURL(new RegExp(`/${secondaryProjectSlug}$`))
  })

  test('navigates to dashboard via "Meine Projekte"', async ({ page }) => {
    await page.goto(`/${projectSlug}`)

    const { projectSwitchRoot, searchInput } = await openProjectSwitchSearch(page)
    await searchInput.fill("Meine Projekte")
    await projectSwitchRoot.getByRole("option", { name: "Meine Projekte" }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByText("Meine Projekte", { exact: true })).toBeVisible()
  })
})
