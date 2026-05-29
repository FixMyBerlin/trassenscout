import db, { SurveyResponseSourceEnum, SurveyResponseStateEnum } from "@/db"
import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { authorizationNoise, pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"

const projectSlug = seedProjects.richProject

type SurveyFixture = {
  surveyId: number
  surveyResponseId: number
  uploadId: number
}

const ensureSurveyFixture = async (): Promise<SurveyFixture> => {
  const project = await db.project.findFirstOrThrow({
    where: { slug: projectSlug },
    select: { id: true },
  })

  const survey = await db.survey.upsert({
    where: { slug: "radnetz-brandenburg" },
    update: {
      projectId: project.id,
      title: "E2E Survey Permissions",
      active: true,
    },
    create: {
      slug: "radnetz-brandenburg",
      projectId: project.id,
      title: "E2E Survey Permissions",
      active: true,
    },
  })

  const surveySession = await db.surveySession.create({
    data: { surveyId: survey.id },
  })

  const surveyResponse = await db.surveyResponse.create({
    data: {
      surveySessionId: surveySession.id,
      surveyPart: 2,
      source: SurveyResponseSourceEnum.FORM,
      state: SurveyResponseStateEnum.SUBMITTED,
      status: "PENDING",
      data: JSON.stringify({
        feedbackText: `E2E response ${Date.now()}`,
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
    surveyId: survey.id,
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

  test.describe("survey responses route", () => {
    test.describe("users without project membership", () => {
      test.use({ storageState: authFile("noProject") })
      test.use({ allowedConsoleErrors: [...pageNoise, ...authorizationNoise] })

      test("cannot open responses", async ({ page }) => {
        await page.goto(`/${projectSlug}/surveys/${surveyFixture.surveyId}/responses`)

        await expect(page.getByRole("heading", { name: "Ein Fehler ist aufgetreten" })).toBeVisible({
          timeout: 30_000,
        })
      })
    })
  })

  test.fixme(
    "viewer/editor response-control assertions are blocked by current survey responses UI warning (uncontrolled -> controlled input)",
    async () => {},
  )

  test.describe("survey upload edit direct URL", () => {
    const uploadEditPath = () =>
      `/${projectSlug}/surveys/${surveyFixture.surveyId}/responses/${surveyFixture.surveyResponseId}/uploads/${surveyFixture.uploadId}/edit`

    test.describe("viewer users", () => {
      test.use({ storageState: authFile("viewer") })
      test.use({ allowedConsoleErrors: pageNoise })

      test("can open the upload edit route", async ({ page }) => {
        await page.goto(uploadEditPath())
        await expect(page.getByRole("heading", { name: "Dokument bearbeiten", exact: true })).toBeVisible({
          timeout: 30_000,
        })
      })
    })

    test.describe("editor users", () => {
      test.use({ storageState: authFile("editor") })
      test.use({ allowedConsoleErrors: pageNoise })

      test("can open the upload edit route", async ({ page }) => {
        await page.goto(uploadEditPath())
        await expect(page.getByRole("heading", { name: "Dokument bearbeiten", exact: true })).toBeVisible({
          timeout: 30_000,
        })
      })
    })

    test.describe("admin users", () => {
      test.use({ storageState: authFile("admin") })
      test.use({ allowedConsoleErrors: pageNoise })

      test("can open the upload edit route without explicit membership", async ({ page }) => {
        await page.goto(uploadEditPath())
        await expect(page.getByRole("heading", { name: "Dokument bearbeiten", exact: true })).toBeVisible({
          timeout: 30_000,
        })
      })
    })

    test.describe("users without project membership", () => {
      test.use({ storageState: authFile("noProject") })
      test.use({ allowedConsoleErrors: [...pageNoise, ...authorizationNoise] })

      test("cannot open the upload edit route", async ({ page }) => {
        await page.goto(uploadEditPath())
        await expect(page.getByRole("heading", { name: "Ein Fehler ist aufgetreten" })).toBeVisible({
          timeout: 30_000,
        })
      })
    })
  })
})
