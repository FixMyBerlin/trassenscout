import type { Page } from "@playwright/test"
import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { getTestDb } from "@/tests/_utils/testDb"

const projectsPath = "/admin/projects"
const aiOnLabel = "KI-Features einschalten (E-Mail-Protokoll, KI-Verarbeitung)"
const aiOffLabel = "KI-Features ausschalten (E-Mail-Protokoll, KI-Verarbeitung)"

const targetSlugs = [
  seedProjects.richProject,
  seedProjects.forbiddenProject,
  seedProjects.secondaryForbiddenProject,
]

function projectRow(page: Page, slug: string) {
  return page.getByRole("row").filter({
    has: page.getByRole("link", { name: slug.toUpperCase() }),
  })
}

test.describe("Admin projects matrix", () => {
  test.describe.configure({ mode: "serial" })
  test.use({ storageState: authFile("admin") })
  test.use({ allowedConsoleErrors: pageNoise })

  let originalAiEnabled: Record<string, boolean> = {}

  test.beforeAll(async () => {
    const db = await getTestDb()
    const projects = await db.project.findMany({
      where: { slug: { in: targetSlugs } },
      select: { slug: true, aiEnabled: true },
    })
    originalAiEnabled = Object.fromEntries(
      projects.map((project) => [project.slug, project.aiEnabled]),
    )
    await db.project.updateMany({
      where: { slug: { in: targetSlugs } },
      data: { aiEnabled: false },
    })
  })

  test.afterAll(async () => {
    const db = await getTestDb()
    for (const [slug, aiEnabled] of Object.entries(originalAiEnabled)) {
      await db.project.update({ where: { slug }, data: { aiEnabled } }).catch(() => {})
    }
  })

  test("filters projects by slug and syncs the URL", async ({ page }) => {
    await page.goto(projectsPath)

    await expect(projectRow(page, seedProjects.richProject)).toBeVisible({ timeout: 30_000 })
    await expect(projectRow(page, seedProjects.forbiddenProject)).toBeVisible()

    // Retry until the URL updates: before hydration the input has no change handler yet.
    // Clear first — refilling the same value would not fire React's onChange.
    const searchInput = page.getByRole("searchbox", { name: "Projekte filtern" })
    await expect(async () => {
      await searchInput.fill("")
      await searchInput.fill("rs0v")
      await expect(page).toHaveURL(/project=rs0v/, { timeout: 2_000 })
    }).toPass({ timeout: 30_000 })

    await expect(projectRow(page, seedProjects.richProject)).toBeHidden()
    await expect(projectRow(page, seedProjects.forbiddenProject)).toBeVisible()
    await expect(projectRow(page, seedProjects.secondaryForbiddenProject)).toBeVisible()
    await expect(page).toHaveURL(/project=rs0v/)

    // Numeric queries arrive as numbers after the router's JSON parsing and must not crash the route
    await searchInput.fill("")
    await searchInput.fill("23")
    await expect(page).toHaveURL(/project=23/)
    await expect(projectRow(page, seedProjects.richProject)).toBeVisible()
    await expect(projectRow(page, seedProjects.forbiddenProject)).toBeHidden()

    // Same for a direct load with a numeric search param
    await page.goto(`${projectsPath}?project=23`)
    await expect(projectRow(page, seedProjects.richProject)).toBeVisible({ timeout: 30_000 })
    await expect(projectRow(page, seedProjects.forbiddenProject)).toBeHidden()
  })

  test("toggles a feature for a single project via checkbox", async ({ page }) => {
    await page.goto(projectsPath)

    const row = projectRow(page, seedProjects.richProject)
    await expect(row).toBeVisible({ timeout: 30_000 })

    // Retry the click until the state flips: before hydration the checkbox has no handler yet
    const offCheckbox = row.getByRole("checkbox", { name: aiOffLabel })
    await expect(async () => {
      if (!(await offCheckbox.isVisible())) {
        await row.getByRole("checkbox", { name: aiOnLabel }).click()
      }
      await expect(offCheckbox).toBeChecked({ timeout: 5_000 })
    }).toPass({ timeout: 30_000 })

    const db = await getTestDb()
    const project = await db.project.findFirst({
      where: { slug: seedProjects.richProject },
      select: { aiEnabled: true },
    })
    expect(project?.aiEnabled).toBe(true)
  })

  test("bulk-toggles a feature for filtered projects only", async ({ page }) => {
    const db = await getTestDb()
    await db.project.update({
      where: { slug: seedProjects.richProject },
      data: { aiEnabled: false },
    })

    await page.goto(`${projectsPath}?project=rs0v`)
    await expect(projectRow(page, seedProjects.forbiddenProject)).toBeVisible({ timeout: 30_000 })

    const bulkOffCheckbox = page.getByRole("checkbox", {
      name: "KI für alle gefilterten Projekte ausschalten",
    })
    await expect(async () => {
      if (!(await bulkOffCheckbox.isVisible())) {
        await page
          .getByRole("checkbox", { name: "KI für alle gefilterten Projekte einschalten" })
          .click()
      }
      await expect(bulkOffCheckbox).toBeChecked({ timeout: 5_000 })
    }).toPass({ timeout: 30_000 })

    const projects = await db.project.findMany({
      where: { slug: { in: targetSlugs } },
      select: { slug: true, aiEnabled: true },
    })
    const aiEnabledBySlug = Object.fromEntries(
      projects.map((project) => [project.slug, project.aiEnabled]),
    )
    expect(aiEnabledBySlug[seedProjects.forbiddenProject]).toBe(true)
    expect(aiEnabledBySlug[seedProjects.secondaryForbiddenProject]).toBe(true)
    // The unfiltered project must not be touched by the bulk update
    expect(aiEnabledBySlug[seedProjects.richProject]).toBe(false)
  })

  test("table has no phantom horizontal overflow and header tooltips are not clipped", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto(projectsPath)
    await expect(projectRow(page, seedProjects.richProject)).toBeVisible({ timeout: 30_000 })

    // Idle tooltips must not widen the scroll container (they used to, via opacity-0 bubbles)
    const wrapper = page.locator("div.overflow-x-auto").first()
    const overflow = await wrapper.evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    }))
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth)

    // Header checkbox tooltips open below the header, inside the wrapper (top placement got clipped)
    await page.getByRole("checkbox", { name: /Auswertungen für alle Projekte/ }).hover()
    const tooltip = page.getByRole("tooltip", { name: /Auswertungen für alle Projekte/ })
    await expect(tooltip).toBeVisible()

    const tooltipBox = await tooltip.boundingBox()
    const wrapperBox = await wrapper.boundingBox()
    expect(tooltipBox!.y).toBeGreaterThanOrEqual(wrapperBox!.y)
    // The last column's tooltip is right-aligned so it must not overflow the wrapper's right edge
    expect(tooltipBox!.x + tooltipBox!.width).toBeLessThanOrEqual(
      wrapperBox!.x + wrapperBox!.width + 1,
    )
  })
})
