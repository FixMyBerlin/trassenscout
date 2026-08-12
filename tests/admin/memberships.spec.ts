import type { Page } from "@playwright/test"
import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { getTestDb } from "@/tests/_utils/testDb"

const membershipsListPath = "/admin/memberships"

async function clickMembershipToggleForProject(
  page: Page,
  projectSlugPattern: RegExp,
  toggleLabel: string,
) {
  const table = page.getByRole("table").filter({
    has: page.getByRole("columnheader", { name: "Projekt" }),
  })
  const projectRow = table.getByRole("row").filter({
    has: page.getByRole("rowheader", { name: projectSlugPattern }),
  })
  const toggle = projectRow.getByRole("button", {
    name: new RegExp(`^${toggleLabel}:`, "i"),
  })

  const saveButton = page.getByRole("button", { name: "Speichern" })

  await expect(projectRow).toBeVisible()
  await expect(toggle).toBeVisible()
  await toggle.scrollIntoViewIfNeeded()

  await expect(async () => {
    if ((await toggle.getAttribute("aria-pressed")) !== "true") {
      await toggle.click()
    }
    await expect(saveButton).toBeEnabled()
  }).toPass({ timeout: 15_000 })
}

test.describe("Admin memberships", () => {
  test.describe.configure({ mode: "serial" })
  test.use({ storageState: authFile("admin") })
  test.use({ allowedConsoleErrors: pageNoise })

  const targetEmail = `e2e-membership-target-${Date.now()}@fixmycity.test`
  let targetUserId: number | undefined

  test.afterAll(async () => {
    if (!targetUserId) return
    const db = await getTestDb()
    await db.membership.deleteMany({ where: { userId: targetUserId } }).catch(() => {})
    await db.user.delete({ where: { id: targetUserId } }).catch(() => {})
  })

  test("renders project columns on memberships list", async ({ page }) => {
    const response = await page.goto(membershipsListPath)
    expect(response?.ok()).toBeTruthy()

    await expect(page.getByRole("heading", { name: "Nutzer & Rechte" })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByRole("columnheader", { name: "User" })).toBeVisible()
    await expect(
      page.getByRole("columnheader", { name: new RegExp(seedProjects.richProject, "i") }),
    ).toBeVisible()
  })

  test("opens user detail and saves membership changes", async ({ page }) => {
    test.setTimeout(60_000)

    const db = await getTestDb()
    const targetUser = await db.user.create({
      data: {
        email: targetEmail,
        firstName: "E2E",
        lastName: "Membership-Target",
      },
      select: { id: true },
    })
    targetUserId = targetUser.id

    await page.goto(membershipsListPath)
    await page.getByRole("link", { name: targetEmail }).click()

    await expect(page).toHaveURL(new RegExp(`/admin/memberships/${targetUser.id}$`), {
      timeout: 30_000,
    })

    const projectHeader = new RegExp(seedProjects.richProject, "i")

    await clickMembershipToggleForProject(page, projectHeader, "Leserechte")
    await page.getByRole("button", { name: "Speichern" }).click()

    await expect(page).toHaveURL(new RegExp(`${membershipsListPath}$`), { timeout: 30_000 })

    const membership = await db.membership.findFirst({
      where: {
        userId: targetUser.id,
        project: { slug: seedProjects.richProject },
      },
    })
    expect(membership?.role).toBe("VIEWER")

    await page.getByRole("link", { name: targetEmail }).click()

    await clickMembershipToggleForProject(page, projectHeader, "Kein Zugriff")
    await page.getByRole("button", { name: "Speichern" }).click()

    await expect(page).toHaveURL(new RegExp(`${membershipsListPath}$`), { timeout: 30_000 })

    const deletedMembership = await db.membership.findFirst({
      where: {
        userId: targetUser.id,
        project: { slug: seedProjects.richProject },
      },
    })
    expect(deletedMembership).toBeNull()
  })
})
