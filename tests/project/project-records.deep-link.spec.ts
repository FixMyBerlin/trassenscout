import db, { ProjectRecordEditingState, ProjectRecordReviewState } from "@/db"
import { createProjectRecordFilterUrl } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/filter/createFilterUrl"
import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"

const projectSlug = seedProjects.richProject

type ProjectRecordDeepLinkFixture = {
  id: number
  searchterm: string
  title: string
}

test.describe("Project records deep link", () => {
  test.use({ storageState: authFile("viewer") })
  test.use({ allowedConsoleErrors: pageNoise })

  let fixture: ProjectRecordDeepLinkFixture

  test.beforeAll(async () => {
    const project = await db.project.findFirstOrThrow({
      where: { slug: projectSlug },
      select: { id: true },
    })

    const searchterm = `e2e-deep-link-${Date.now()}`
    const title = `E2E Deep Link ${searchterm}`
    const projectRecord = await db.projectRecord.create({
      data: {
        projectId: project.id,
        title,
        body: `Deep-link body ${searchterm}`,
        editingState: ProjectRecordEditingState.PENDING,
        reviewState: ProjectRecordReviewState.APPROVED,
        projectRecordAuthorType: "USER",
        projectRecordUpdatedByType: "USER",
      },
      select: { id: true },
    })

    fixture = {
      id: projectRecord.id,
      searchterm,
      title,
    }
  })

  test.afterAll(async () => {
    if (!fixture) return
    await db.projectRecord.delete({ where: { id: fixture.id } }).catch(() => {})
  })

  test("hydrates the project record filter state from the URL", async ({ page }) => {
    const route = createProjectRecordFilterUrl(projectSlug, {
      searchterm: fixture.searchterm,
    })

    await page.goto(route)
    await expect(page.getByRole("heading", { name: "Projektprotokoll", exact: true })).toBeVisible({
      timeout: 30_000,
    })

    const filterInput = page.getByPlaceholder("Eingaben nach Suchwort filtern")
    await expect(filterInput).toHaveValue(fixture.searchterm)
    await expect(page.getByRole("link", { name: fixture.title, exact: true })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.locator("tbody tr")).toHaveCount(1)
    await expect(page).toHaveURL(/filter=/)
  })
})
