import type { Page } from "@playwright/test"
import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"

/**
 * The map/list view lives in the URL as `?view=`, so it can be shared, restored via back/forward
 * and carried into a Planungsabschnitt. `map` is the default and is kept out of the URL.
 * See src/shared/routing/viewModeSearch.ts.
 */

const projectSlug = seedProjects.richProject
const projectPath = `/${projectSlug}`

const mapButton = (page: Page) => page.getByRole("button", { name: "Kartenansicht" })
const listButton = (page: Page) => page.getByRole("button", { name: "Listenansicht" })

const hasViewParam = (page: Page) => new URL(page.url()).searchParams.has("view")

const expectMapView = async (page: Page) => {
  await expect(mapButton(page)).toHaveAttribute("aria-pressed", "true")
  await expect(listButton(page)).toHaveAttribute("aria-pressed", "false")
}

const expectListView = async (page: Page) => {
  await expect(listButton(page)).toHaveAttribute("aria-pressed", "true")
  await expect(mapButton(page)).toHaveAttribute("aria-pressed", "false")
}

const gotoWithViewSwitch = async (page: Page, path: string) => {
  await page.goto(path)
  await expect(page.getByRole("group", { name: "Ansicht wechseln" })).toBeVisible({
    timeout: 30_000,
  })
}

test.describe("Dashboard view mode in the URL", () => {
  test.use({ storageState: authFile("viewer") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("defaults to the map view and keeps the default out of the URL", async ({ page }) => {
    await gotoWithViewSwitch(page, projectPath)

    await expectMapView(page)
    expect(hasViewParam(page)).toBe(false)
  })

  test("shares the list view via the URL and restores it on reload", async ({ page }) => {
    await gotoWithViewSwitch(page, projectPath)

    await listButton(page).click()
    await expect(page).toHaveURL(/\?view=list$/)
    await expectListView(page)

    // A recipient opening the shared link (or the author reloading) lands on the same view.
    await page.reload()
    await expectListView(page)
  })

  test("switching back to the map drops the default from the URL", async ({ page }) => {
    await gotoWithViewSwitch(page, `${projectPath}?view=list`)
    await expectListView(page)

    await mapButton(page).click()

    await expectMapView(page)
    expect(hasViewParam(page)).toBe(false)
  })

  test("browser back and forward return to the same view", async ({ page }) => {
    await gotoWithViewSwitch(page, projectPath)

    await listButton(page).click()
    await expectListView(page)

    await page.goBack()
    await expectMapView(page)

    await page.goForward()
    await expectListView(page)
  })

  test("keeps the list view when opening a Planungsabschnitt", async ({ page }) => {
    await gotoWithViewSwitch(page, `${projectPath}?view=list`)
    await expectListView(page)

    // First data row of the Planungsabschnitte table (row 0 is the header).
    await page.getByRole("row").nth(1).click()

    await expect(page).toHaveURL(new RegExp(`/${projectSlug}/abschnitte/[^/?]+\\?view=list$`))
    await expectListView(page)
  })

  test("falls back to the map view when the URL carries an unknown view", async ({ page }) => {
    await gotoWithViewSwitch(page, `${projectPath}?view=bogus`)

    await expectMapView(page)
  })
})
