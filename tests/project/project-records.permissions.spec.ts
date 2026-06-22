import db, { ProjectRecordEditingState, ProjectRecordReviewState } from "@/db"
import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { authorizationNoise, pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { expectErrorPage } from "@/tests/_utils/pageAssertions"
import type { Page } from "@playwright/test"

const projectSlug = seedProjects.richProject
const listPath = `/${projectSlug}/project-records`

const ensureProjectRecordPersistenceFixture = async () => {
  const project = await db.project.findFirstOrThrow({
    where: { slug: projectSlug },
    select: { id: true },
  })

  return db.projectRecord.create({
    data: {
      projectId: project.id,
      title: `E2E Persistenz ${Date.now()}`,
      body: "Ausgangsnotiz fuer Persistenztest",
      editingState: ProjectRecordEditingState.PENDING,
      reviewState: ProjectRecordReviewState.APPROVED,
      projectRecordAuthorType: "USER",
      projectRecordUpdatedByType: "USER",
    },
    select: {
      id: true,
      title: true,
      body: true,
    },
  })
}

const ensureProjectRecordId = async (page: Page) => {
  await page.goto(listPath)
  await expect(page.getByRole("heading", { name: "Projektprotokoll", exact: true })).toBeVisible({
    timeout: 30_000,
  })

  const firstRecordLink = page.locator("tbody tr td a").first()
  if ((await page.locator("tbody tr td a").count()) > 0) {
    const href = await firstRecordLink.getAttribute("href")
    const matched = href?.match(/\/project-records\/(\d+)$/)
    if (!matched) throw new Error(`Could not parse project record id from href: ${href}`)
    return Number(matched[1])
  }

  const title = `E2E Rechte ${Date.now()}`
  await page.getByRole("button", { name: "Neuer Protokolleintrag", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Neuer Protokolleintrag", exact: true }),
  ).toBeVisible({
    timeout: 30_000,
  })
  await page.getByRole("button", { name: /Leeres Formular/ }).click()
  await page.getByLabel("Titel").fill(title)
  await page.getByRole("button", { name: "Protokolleintrag speichern", exact: true }).click()

  const createdLink = page.locator(`a[title="${title}"]`).first()
  await expect(createdLink).toBeVisible({ timeout: 30_000 })
  const href = await createdLink.getAttribute("href")
  const matched = href?.match(/\/project-records\/(\d+)$/)
  if (!matched) throw new Error(`Could not parse created project record id from href: ${href}`)
  return Number(matched[1])
}

test.describe("Project records permissions", () => {
  test.describe.configure({ mode: "serial" })

  let projectRecordId: number
  let persistenceProjectRecordId: number

  test.describe("prepare record", () => {
    test.use({ storageState: authFile("editor") })
    test.use({ allowedConsoleErrors: pageNoise })

    test("creates or finds a record id for permission checks", async ({ page }) => {
      projectRecordId = await ensureProjectRecordId(page)
      expect(projectRecordId).toBeGreaterThan(0)
    })

    test("creates a dedicated record for persistence checks", async () => {
      const projectRecord = await ensureProjectRecordPersistenceFixture()
      persistenceProjectRecordId = projectRecord.id
      expect(persistenceProjectRecordId).toBeGreaterThan(0)
    })
  })

  test.afterAll(async () => {
    // Clean up the dedicated persistence fixture row so it doesn't accumulate across runs.
    if (persistenceProjectRecordId) {
      await db.projectRecord.delete({ where: { id: persistenceProjectRecordId } }).catch(() => {
        // Ignore if already deleted (e.g. test suite was aborted mid-run).
      })
    }
  })

  test.describe("edit direct URL", () => {
    test.describe("viewer users", () => {
      test.use({ storageState: authFile("viewer") })
      test.use({ allowedConsoleErrors: [...pageNoise, ...authorizationNoise] })

      test("cannot open edit URL", async ({ page }) => {
        await page.goto(`/${projectSlug}/project-records/${projectRecordId}/edit`)
        await expectErrorPage(page)
      })
    })

    test.describe("editor users", () => {
      test.use({ storageState: authFile("editor") })
      test.use({ allowedConsoleErrors: pageNoise })

      test("can open edit URL", async ({ page }) => {
        await page.goto(`/${projectSlug}/project-records/${projectRecordId}/edit`)
        await expect(
          page.getByRole("heading", { name: /Protokolleintrag bearbeiten/, exact: false }),
        ).toBeVisible({
          timeout: 30_000,
        })
      })

      test("persists title and body changes after save and fresh reload", async ({
        browser,
        page,
      }) => {
        const updatedTitle = `E2E Persistiert ${Date.now()}`
        const updatedBody = `Persistierte Notiz ${Date.now()}`

        await page.goto(`/${projectSlug}/project-records/${persistenceProjectRecordId}/edit`)
        await expect(
          page.getByRole("heading", { name: /Protokolleintrag bearbeiten/, exact: false }),
        ).toBeVisible({
          timeout: 30_000,
        })

        await page.getByLabel("Titel").fill(updatedTitle)
        await page.getByLabel("Notizen").fill(updatedBody)
        await Promise.all([
          page.waitForResponse(
            (r) =>
              r.url().includes("/api/rpc/") &&
              r.request().method() === "POST" &&
              r.status() === 200,
            { timeout: 15_000 },
          ),
          page.getByRole("button", { name: "Änderungen speichern", exact: true }).click(),
        ])

        await expect(page.getByLabel("Titel")).toHaveValue(updatedTitle)
        await expect(page.getByLabel("Notizen")).toHaveValue(updatedBody)

        const freshContext = await browser.newContext({ storageState: authFile("editor") })
        const freshPage = await freshContext.newPage()

        await freshPage.goto(`/${projectSlug}/project-records/${persistenceProjectRecordId}`)
        await expect(
          freshPage.getByRole("heading", { name: updatedTitle, exact: true }),
        ).toBeVisible({
          timeout: 30_000,
        })
        await expect(freshPage.getByText(updatedBody, { exact: true })).toBeVisible({
          timeout: 30_000,
        })

        await freshContext.close()
      })

      test("persists comments after create and fresh reload", async ({ browser, page }) => {
        const comment = `E2E Kommentar ${Date.now()}`

        await page.goto(`/${projectSlug}/project-records/${persistenceProjectRecordId}`)
        await expect(page.getByRole("heading", { name: /Kommentare/, exact: true })).toBeVisible({
          timeout: 30_000,
        })

        const commentField = page.locator('textarea[name="body"]').first()
        await expect(commentField).toBeVisible({ timeout: 30_000 })
        await commentField.fill(comment)
        await page.getByRole("button", { name: "Kommentar hinzufügen", exact: true }).click()

        await expect(page.getByText(comment, { exact: true })).toBeVisible({ timeout: 30_000 })
        await expect(commentField).toHaveValue("")
        await page
          .waitForResponse((r) => r.url().includes("/api/rpc/") && r.status() === 200, {
            timeout: 15_000,
          })
          .catch(() => {})

        const freshContext = await browser.newContext({ storageState: authFile("editor") })
        const freshPage = await freshContext.newPage()

        await freshPage.goto(`/${projectSlug}/project-records/${persistenceProjectRecordId}`)
        await expect(freshPage.getByText(comment, { exact: true })).toBeVisible({
          timeout: 30_000,
        })

        await freshContext.close()
      })
    })

    test.describe("admin users", () => {
      test.use({ storageState: authFile("admin") })
      test.use({ allowedConsoleErrors: pageNoise })

      test("can open edit URL without explicit membership", async ({ page }) => {
        await page.goto(`/${projectSlug}/project-records/${projectRecordId}/edit`)
        await expect(
          page.getByRole("heading", { name: /Protokolleintrag bearbeiten/, exact: false }),
        ).toBeVisible({
          timeout: 30_000,
        })
      })
    })

    test.describe("users without project membership", () => {
      test.use({ storageState: authFile("noProject") })
      test.use({ allowedConsoleErrors: [...pageNoise, ...authorizationNoise] })

      test("cannot open edit URL", async ({ page }) => {
        await page.goto(`/${projectSlug}/project-records/${projectRecordId}/edit`)
        await expectErrorPage(page)
      })
    })
  })

  test.describe("create entry point", () => {
    test.describe("viewer users", () => {
      test.use({ storageState: authFile("viewer") })
      test.use({ allowedConsoleErrors: pageNoise })

      test("do not see create button", async ({ page }) => {
        await page.goto(listPath)
        await expect(
          page.getByRole("heading", { name: "Projektprotokoll", exact: true }),
        ).toBeVisible({
          timeout: 30_000,
        })
        await expect(
          page.getByRole("button", { name: "Neuer Protokolleintrag", exact: true }),
        ).toBeHidden()
      })
    })

    test.describe("editor users", () => {
      test.use({ storageState: authFile("editor") })
      test.use({ allowedConsoleErrors: pageNoise })

      test("can open create modal", async ({ page }) => {
        await page.goto(listPath)
        await page.getByRole("button", { name: "Neuer Protokolleintrag", exact: true }).click()
        await expect(page.getByRole("button", { name: /Leeres Formular/ })).toBeVisible({
          timeout: 30_000,
        })
      })
    })
  })
})
