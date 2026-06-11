import { authFile, seedProjects, seedUsers } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { waitForFormReady, waitForSubmitReady } from "@/tests/_utils/waitForFormReady"

const newMembershipPath = "/admin/memberships/new"
const membershipsListPath = "/admin/memberships"

test.describe("Admin membership create page", () => {
  test.describe.configure({ mode: "serial" })
  test.use({ storageState: authFile("admin") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("renders /admin/memberships/new without userId param", async ({ page }) => {
    const response = await page.goto(newMembershipPath)
    expect(response?.ok()).toBeTruthy()

    await expect(page.getByRole("heading", { name: "Neue Mitgliedschaft" })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByRole("button", { name: "Erstellen" })).toBeVisible()
  })

  test("renders /admin/memberships/new with userId query param", async ({ page }) => {
    const response = await page.goto(`${newMembershipPath}?userId=1`)
    expect(response?.ok()).toBeTruthy()

    await expect(page.getByRole("heading", { name: "Neue Mitgliedschaft" })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByLabel("User", { exact: true })).toHaveValue("1", {
      timeout: 30_000,
    })
  })

  test("creates membership and redirects to list", async ({ page }) => {
    await page.goto(newMembershipPath)
    await waitForFormReady(page, ["User"])
    await waitForSubmitReady(page, "Erstellen")

    await page.getByLabel("User", { exact: true }).selectOption({
      label: "No-Project No-Project-User <no-project@fixmycity.test>",
    })
    await page
      .getByLabel("Projekt, auf dem User Rechte erhalten soll")
      .selectOption({ label: "rs23 — Radschnellverbindung Berliner Wasserwege" })

    await page.getByRole("button", { name: "Erstellen", exact: true }).click()

    await expect(page).toHaveURL(new RegExp(`${membershipsListPath}$`), { timeout: 30_000 })
    await expect(page.getByText(seedUsers.noProject).first()).toBeVisible()

    const membershipRow = page
      .locator("tr", { hasText: seedUsers.noProject })
      .locator("div.flex.justify-between", { hasText: new RegExp(seedProjects.richProject, "i") })

    await Promise.all([
      page.waitForEvent("dialog").then((dialog) => dialog.accept()),
      membershipRow.getByRole("button", { name: "Löschen" }).click(),
    ])

    await expect(membershipRow).toHaveCount(0, { timeout: 30_000 })
  })
})
