import { responseConfig as radnetzBrandenburgResponseConfig } from "@/src/components/beteiligung/surveys/radnetz-brandenbrug/response-config"
import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { authorizationNoise, pageNoise, surveyNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { expectAccessDeniedRedirect } from "@/tests/_utils/pageAssertions"
import { getTestDb } from "@/tests/_utils/testDb"

const projectSlug = seedProjects.richProject
const surveySlug = "radnetz-brandenburg" as const
const surveyCategoryFieldId = String(radnetzBrandenburgResponseConfig.evaluationRefs.category)
const surveyFeedbackTextFieldId = String(
  radnetzBrandenburgResponseConfig.evaluationRefs.feedbackText,
)

type SurveyFixture = {
  surveyId: number
  surveySessionId: number
  surveyResponseId: number
  uploadId: number
}

const ensureSurveyFixture = async (): Promise<SurveyFixture> => {
  const db = await getTestDb()
  const project = await db.project.findFirstOrThrow({
    where: { slug: projectSlug },
    select: { id: true },
  })

  const existingSurvey = await db.survey.findUnique({
    where: { slug: surveySlug },
    select: { id: true, projectId: true },
  })

  if (existingSurvey && existingSurvey.projectId !== project.id) {
    throw new Error(
      `Survey "${surveySlug}" exists on projectId=${existingSurvey.projectId}, expected projectId=${project.id} for ${projectSlug}.`,
    )
  }

  const surveyId =
    existingSurvey?.id ??
    (
      await db.survey.create({
        data: {
          slug: surveySlug,
          projectId: project.id,
          title: "E2E Survey Permissions",
          active: true,
        },
        select: { id: true },
      })
    ).id

  const surveySession = await db.surveySession.create({
    data: { surveyId },
  })

  const surveyResponse = await db.surveyResponse.create({
    data: {
      surveySessionId: surveySession.id,
      surveyPart: 2,
      source: "FORM",
      state: "SUBMITTED",
      status: "PENDING",
      data: JSON.stringify({
        [surveyCategoryFieldId]: "1",
        [surveyFeedbackTextFieldId]: `E2E response ${Date.now()}`,
      }),
    },
  })

  const upload = await db.upload.create({
    data: {
      projectId: project.id,
      surveyResponseId: surveyResponse.id,
      title: `E2E Survey Upload ${Date.now()}`,
      externalUrl: "https://example.com/e2e-survey-upload.pdf",
      mimeType: "application/pdf",
    },
  })

  return {
    surveyId,
    surveySessionId: surveySession.id,
    surveyResponseId: surveyResponse.id,
    uploadId: upload.id,
  }
}

test.describe("Survey permissions", () => {
  test.describe.configure({ mode: "serial" })

  let surveyFixture: SurveyFixture

  test.beforeAll(async () => {
    surveyFixture = await ensureSurveyFixture()
  })

  test.afterAll(async () => {
    // Clean up fixture rows in reverse dependency order so they don't accumulate across runs.
    // The survey itself is intentionally not deleted — it may have pre-existed.
    if (!surveyFixture) return
    const db = await getTestDb()
    await db.upload.delete({ where: { id: surveyFixture.uploadId } }).catch(() => {})
    await db.surveyResponse
      .delete({ where: { id: surveyFixture.surveyResponseId } })
      .catch(() => {})
    await db.surveySession.delete({ where: { id: surveyFixture.surveySessionId } }).catch(() => {})
  })

  test.describe("survey responses route", () => {
    test.describe("users without project membership", () => {
      test.use({ storageState: authFile("noProject") })
      test.use({ allowedConsoleErrors: [...pageNoise, ...authorizationNoise] })

      test("cannot open responses", async ({ page }) => {
        await page.goto(`/${projectSlug}/surveys/${surveyFixture.surveyId}/responses`)
        await expectAccessDeniedRedirect(page)
      })
    })
  })

  test.describe("survey response controls", () => {
    const responsesDetailsPath = () =>
      `/${projectSlug}/surveys/${surveyFixture.surveyId}/responses?responseDetails=${surveyFixture.surveyResponseId}`

    test.describe("viewer users", () => {
      test.use({ storageState: authFile("viewer") })
      test.use({ allowedConsoleErrors: surveyNoise })

      test("see response controls as read-only", async ({ page }) => {
        await page.goto(responsesDetailsPath())
        await expect(page.locator('input[name="responseOperator"]').first()).toBeVisible({
          timeout: 30_000,
        })

        await expect(page.locator('input[name="responseOperator"]').first()).toBeDisabled()
        await expect(page.locator('input[name="responseStatus"]').first()).toBeDisabled()
        await expect(page.locator('textarea[name="note"]')).toBeDisabled()
        await expect(page.locator("textarea#body")).toHaveCount(0)
        await expect(page.getByRole("button", { name: /speichern/i })).toHaveCount(0)
      })
    })

    test.describe("editor users", () => {
      test.use({ storageState: authFile("editor") })
      test.use({ allowedConsoleErrors: surveyNoise })

      test("can edit response controls", async ({ page }) => {
        await page.goto(responsesDetailsPath())
        await expect(page.locator('input[name="responseOperator"]').first()).toBeVisible({
          timeout: 30_000,
        })

        await expect(page.locator('input[name="responseOperator"]').first()).toBeEnabled()
        await expect(page.locator('input[name="responseStatus"]').first()).toBeEnabled()
        await expect(page.locator('textarea[name="note"]')).toBeEnabled()
        await expect(page.locator("textarea#body")).toBeVisible()
        await expect(page.getByRole("button", { name: /speichern/i })).toBeVisible()
      })

      test("persists note changes after save and reload", async ({ browser, page }) => {
        const note = `E2E note ${Date.now()}`

        await page.goto(responsesDetailsPath())

        const noteField = page.locator('textarea[name="note"]')
        const saveButton = page.getByRole("button", {
          name: /rückmeldung an beteiligte speichern/i,
        })

        await expect(noteField).toBeVisible({ timeout: 30_000 })
        await noteField.fill(note)
        await saveButton.click()

        await expect(noteField).toHaveValue(note)
        await page
          .waitForResponse((r) => r.url().includes("/api/rpc/") && r.status() === 200, {
            timeout: 15_000,
          })
          .catch(() => {})

        const freshContext = await browser.newContext({ storageState: authFile("editor") })
        const freshPage = await freshContext.newPage()

        await freshPage.goto(responsesDetailsPath())
        const freshNoteField = freshPage.locator('textarea[name="note"]')
        await expect(freshNoteField).toBeVisible({ timeout: 30_000 })
        await expect(freshNoteField).toHaveValue(note)

        await freshContext.close()
      })
    })

    test.describe("admin users", () => {
      test.use({ storageState: authFile("admin") })
      test.use({ allowedConsoleErrors: surveyNoise })

      test("can edit response controls without explicit membership", async ({ page }) => {
        await page.goto(responsesDetailsPath())
        await expect(page.locator('input[name="responseOperator"]').first()).toBeVisible({
          timeout: 30_000,
        })

        await expect(page.locator('input[name="responseOperator"]').first()).toBeEnabled()
        await expect(page.locator('input[name="responseStatus"]').first()).toBeEnabled()
        await expect(page.locator('textarea[name="note"]')).toBeEnabled()
        await expect(page.locator("textarea#body")).toBeVisible()
      })
    })

    test.describe("users without project membership", () => {
      test.use({ storageState: authFile("noProject") })
      test.use({ allowedConsoleErrors: [...pageNoise, ...authorizationNoise] })

      test("cannot open response details", async ({ page }) => {
        await page.goto(responsesDetailsPath())
        await expectAccessDeniedRedirect(page)
      })
    })
  })

  test.describe("survey upload edit direct URL", () => {
    const uploadEditPath = () =>
      `/${projectSlug}/surveys/${surveyFixture.surveyId}/responses/${surveyFixture.surveyResponseId}/uploads/${surveyFixture.uploadId}/edit`

    test.describe("viewer users", () => {
      test.use({ storageState: authFile("viewer") })
      test.use({ allowedConsoleErrors: [...pageNoise, ...authorizationNoise] })

      test("cannot open the upload edit route", async ({ page }) => {
        await page.goto(uploadEditPath())
        await expectAccessDeniedRedirect(page)
      })
    })

    test.describe("editor users", () => {
      test.use({ storageState: authFile("editor") })
      test.use({ allowedConsoleErrors: pageNoise })

      test("can open the upload edit route", async ({ page }) => {
        await page.goto(uploadEditPath())
        await expect(
          page.getByRole("heading", { name: "Dokument bearbeiten", exact: true }),
        ).toBeVisible({
          timeout: 30_000,
        })
      })
    })

    test.describe("admin users", () => {
      test.use({ storageState: authFile("admin") })
      test.use({ allowedConsoleErrors: pageNoise })

      test("can open the upload edit route without explicit membership", async ({ page }) => {
        await page.goto(uploadEditPath())
        await expect(
          page.getByRole("heading", { name: "Dokument bearbeiten", exact: true }),
        ).toBeVisible({
          timeout: 30_000,
        })
      })
    })

    test.describe("users without project membership", () => {
      test.use({ storageState: authFile("noProject") })
      test.use({ allowedConsoleErrors: [...pageNoise, ...authorizationNoise] })

      test("cannot open the upload edit route", async ({ page }) => {
        await page.goto(uploadEditPath())
        await expectAccessDeniedRedirect(page)
      })
    })
  })
})
