import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { uploadPageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { getTestDb } from "@/tests/_utils/testDb"

const projectSlug = seedProjects.richProject
const uploadsPath = `/${projectSlug}/uploads`

type UploadModalFixture = {
  uploadId: number
  uploadTitle: string
}

test.describe("Upload edit return flow", () => {
  test.use({ storageState: authFile("editor") })
  test.use({ allowedConsoleErrors: uploadPageNoise })

  let fixture: UploadModalFixture

  test.beforeAll(async () => {
    const db = await getTestDb()
    const project = await db.project.findFirstOrThrow({
      where: { slug: projectSlug },
      select: { id: true },
    })

    const uploadTitle = `E2E Upload ${Date.now()}`
    const upload = await db.upload.create({
      data: {
        projectId: project.id,
        title: uploadTitle,
        externalUrl: "https://example.com/e2e-upload.pdf",
        mimeType: "application/pdf",
      },
      select: { id: true },
    })

    fixture = {
      uploadId: upload.id,
      uploadTitle,
    }
  })

  test.afterAll(async () => {
    if (!fixture) return
    const db = await getTestDb()
    await db.upload.delete({ where: { id: fixture.uploadId } }).catch(() => {})
  })

  test("returns from the edit route back to the uploads list via returnTo", async ({ page }) => {
    const editPath = `/${projectSlug}/uploads/${fixture.uploadId}/edit?returnTo=${encodeURIComponent(uploadsPath)}`

    await page.goto(editPath)
    await expect(
      page.getByRole("heading", { name: "Dokument bearbeiten", exact: true }),
    ).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByLabel("Kurzbeschreibung")).toHaveValue(fixture.uploadTitle)

    const maybeDirtyConfirm = page
      .waitForEvent("dialog", { timeout: 1_000 })
      .then(async (dialog) => {
        expect(dialog.message()).toContain("Ungespeicherte Änderungen verwerfen?")
        await dialog.accept()
      })
      .catch(() => {})

    await page.getByRole("link", { name: "Zurück", exact: true }).click()
    await maybeDirtyConfirm

    await expect(page).toHaveURL(new RegExp(`/${projectSlug}/uploads$`))
    await expect(page.getByRole("heading", { name: "Dokumente", exact: true })).toBeVisible({
      timeout: 30_000,
    })
    await expect(
      page.getByRole("heading", { name: "Dokument bearbeiten", exact: true }),
    ).toHaveCount(0)
    await expect(page.locator("tbody tr", { hasText: fixture.uploadTitle }).first()).toBeVisible({
      timeout: 30_000,
    })
  })
})
