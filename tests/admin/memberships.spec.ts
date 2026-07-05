import type { Page } from "@playwright/test"
import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { getTestDb } from "@/tests/_utils/testDb"

const membershipsListPath = "/admin/memberships"

function membershipsTable(page: Page) {
  return page.getByRole("table").filter({
    has: page.getByRole("columnheader", { name: "User" }),
  })
}

async function clickMembershipToggleInColumn(
  page: Page,
  projectSlugPattern: RegExp,
  toggleLabel: string,
) {
  const table = membershipsTable(page)
  const header = table.getByRole("columnheader", { name: projectSlugPattern })
  await expect(header).toBeVisible()

  const columnIndex = await header.evaluate((element) => {
    const headerRow = element.closest("tr")
    if (!headerRow) return -1
    return Array.from(headerRow.children).indexOf(element)
  })

  expect(columnIndex).toBeGreaterThan(-1)

  const toggle = table
    .locator("tbody tr")
    .first()
    .locator(`td:nth-child(${columnIndex + 1})`)
    .getByRole("button", { name: toggleLabel })

  const saveButton = page.getByRole("button", { name: "Speichern" })

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

    await clickMembershipToggleInColumn(page, projectHeader, "Leserechte")
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

    await clickMembershipToggleInColumn(page, projectHeader, "Kein Zugriff")
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
