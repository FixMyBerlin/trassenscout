import type { Page } from "@playwright/test"
import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { uploadPageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { cleanupNoProjectMemberships } from "@/tests/_utils/cleanupNoProjectMemberships"

const projectSlug = seedProjects.richProject
// Seeded in rs3000, not in rs23 (prisma/seeds/uploads.ts).
const otherProjectUploadTitle = "Gesamttreffen Projekt 2"

// Body rows only.
const documentRows = (page: Page) =>
  page
    .getByRole("table")
    .getByRole("row")
    .filter({ has: page.getByRole("cell") })
const projectLink = (page: Page, name: string) =>
  page.getByRole("table").getByRole("link", { name, exact: true })

async function selectProject(page: Page, name: string) {
  await page.getByRole("button", { name: /Projekt filtern/ }).click()
  await page.getByRole("option", { name, exact: true }).click()
}

async function openFirstDocument(page: Page) {
  // The preview is the row's first button.
  const previewButton = documentRows(page).first().getByRole("button").first()
  await expect(previewButton).toHaveAttribute("data-upload-preview-ready", "true", {
    timeout: 30_000,
  })

  await previewButton.click()

  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 30_000 })
}

test.describe("Dashboard documents", () => {
  test.use({ allowedConsoleErrors: uploadPageNoise })

  test.describe("as viewer", () => {
    test.use({ storageState: authFile("viewer") })

    test("keeps the project filter when switching to the tab", async ({ page }) => {
      await page.goto(`/dashboard/assignments?projectSlug=${projectSlug}`)
      await expect(page.getByRole("button", { name: "User-Menü" })).toBeVisible({
        timeout: 30_000,
      })

      await page.getByRole("link", { name: "Dokumente", exact: true }).click()

      await expect(page).toHaveURL(new RegExp(`/dashboard/uploads\\?projectSlug=${projectSlug}`))
      await expect(projectLink(page, "RS23").first()).toBeVisible({ timeout: 30_000 })
      await expect(projectLink(page, "RS3000")).toHaveCount(0)
      await expect(page.getByRole("link", { name: "bearbeiten" })).toHaveCount(0)
    })

    test("searches across projects and combines the search with the project filter", async ({
      page,
    }) => {
      await page.goto("/dashboard/uploads")
      await expect(documentRows(page).first()).toBeVisible({ timeout: 30_000 })

      await page.getByPlaceholder("Titel und Inhalte durchsuchen").fill(otherProjectUploadTitle)

      await expect(page).toHaveURL(/searchterm=/)
      await expect(documentRows(page)).toHaveCount(1)
      await expect(projectLink(page, "RS3000")).toBeVisible()

      await selectProject(page, "RS23")

      await expect(page).toHaveURL(new RegExp(`projectSlug=${projectSlug}`))
      await expect(page).toHaveURL(/searchterm=/)
      await expect(page.getByText("0 Ergebnisse")).toBeVisible({ timeout: 30_000 })
      await page.getByRole("button", { name: "Alle Filter zurücksetzen" }).click()

      await expect(page).not.toHaveURL(/projectSlug|searchterm/)
      await expect(documentRows(page).nth(1)).toBeVisible({ timeout: 30_000 })
    })

    test("opens a document in place", async ({ page }) => {
      await page.goto(`/dashboard/uploads?projectSlug=${projectSlug}`)
      await openFirstDocument(page)

      await expect(page).toHaveURL(new RegExp(`modalProjectSlug=${projectSlug}`))
      await page.getByRole("dialog").getByRole("button", { name: "Schließen" }).click()

      await expect(page.getByRole("dialog")).toHaveCount(0)
      await expect(page).not.toHaveURL(/modalUploadId/)
    })

    test("cannot open the edit view through a link", async ({ page }) => {
      await page.goto(`/dashboard/uploads?projectSlug=${projectSlug}`)
      await openFirstDocument(page)

      const url = new URL(page.url())
      url.searchParams.set("modalUploadView", "edit")
      await page.goto(url.toString())

      await expect(page).not.toHaveURL(/modalUploadView=edit/, { timeout: 30_000 })
      await expect(page.getByRole("dialog")).toHaveCount(0)
      await expect(page.getByRole("button", { name: "Speichern" })).toHaveCount(0)
    })
  })

  test.describe("as editor", () => {
    test.use({ storageState: authFile("editor") })

    test("edits a document in a modal and offers no delete in the list", async ({ page }) => {
      await page.goto(`/dashboard/uploads?projectSlug=${projectSlug}`)

      const editLink = page.getByRole("link", { name: "bearbeiten" }).first()
      await expect(editLink).toBeVisible({ timeout: 30_000 })
      await expect(page.getByRole("button", { name: "Löschen" })).toHaveCount(0)

      await editLink.click()

      const dialog = page.getByRole("dialog")
      await expect(dialog.getByRole("button", { name: "Speichern" })).toBeVisible({
        timeout: 30_000,
      })
      await expect(page).toHaveURL(/\/dashboard\/uploads\?.*modalUploadView=edit/)
      await expect(page).toHaveURL(new RegExp(`modalProjectSlug=${projectSlug}`))
    })
  })

  test.describe("without projects", () => {
    test.use({ storageState: authFile("noProject") })
    test.beforeEach(cleanupNoProjectMemberships)

    test("sees no documents", async ({ page }) => {
      await page.goto("/dashboard/uploads")

      await expect(page.getByText("Es wurden noch keine Dokumente hochgeladen.")).toBeVisible({
        timeout: 30_000,
      })
    })
  })
})
