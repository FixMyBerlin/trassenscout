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

  test("closes when another project navigation item is selected", async ({ page }) => {
    await page.goto(`/${projectSlug}`)

    const { projectSwitch, searchInput } = await openProjectSwitchSearch(page)
    await page.getByRole("link", { name: "Dokumente" }).click()

    await expect(page).toHaveURL(new RegExp(`/${projectSlug}/uploads$`))
    // Assert on the switch button, not the dropdown: `toBeHidden` also passes for an element that
    // has not rendered yet, so it could go green before the menu reappeared.
    await expect(projectSwitch).toHaveAttribute("aria-expanded", "false")
    await expect(searchInput).toBeHidden()

    // Regression: the open state must not survive the navigation and reappear on the way back.
    await page.goBack()
    await expect(page).toHaveURL(new RegExp(`/${projectSlug}$`))
    await expect(projectSwitch).toHaveAttribute("aria-expanded", "false")
  })
})
