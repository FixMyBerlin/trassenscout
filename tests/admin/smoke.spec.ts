import { authFile } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"
import { assertFormValidationOnEmptySubmit } from "@/tests/project/_shared/formValidation"

const adminPages = [
  {
    path: "/admin",
    visibleText: "Dashboard",
  },
  {
    path: "/admin/support-documents",
    visibleText: "Support-Dokumente",
  },
  {
    path: "/admin/projects",
    visibleText: "Planungsabschnitte",
  },
  {
    path: "/admin/projects",
    visibleText: "KI",
  },
  {
    path: "/admin/projects",
    visibleText: "ALKIS-Demoprojekte",
  },
  {
    path: "/admin/projects",
    visibleText: "Log-Einträge",
  },
  {
    path: "/admin/projects/new",
    visibleText: "Kürzel",
  },
  {
    path: "/admin/memberships",
    visibleText: "Nutzer & Rechte",
  },
  {
    path: "/admin/surveys",
    visibleText: "radnetz-brandenburg",
  },
  {
    path: "/admin/surveys/new",
    visibleText: "Slug",
  },
  {
    path: "/admin/surveys/4/edit",
    visibleText: "Beteiligung 4",
  },
  {
    path: "/admin/surveys/4/responses",
    visibleText: "Radnetz Brandenburg",
  },
  {
    path: "/admin/surveys/4/responses/test",
    visibleText: "Testeinträge",
  },
  {
    path: "/admin/surveys/4/responses/created",
    visibleText: "Nicht-abgeschickte Antworten",
  },
  {
    path: "/admin/logEntries",
    visibleText: "Einträgen",
  },
  {
    path: "/admin/email-templates",
    visibleText: "Passwort zurücksetzen",
  },
  {
    path: "/admin/email-templates/forgot_password/edit",
    visibleText: "Passwort zurücksetzen",
  },
  {
    path: "/admin/project-records",
    visibleText: "Protokolleinträge",
  },
  {
    path: "/admin/project-record-emails",
    visibleText: "Neue E-Mail manuell hinzufügen",
  },
  {
    path: "/admin/project-record-emails/new",
    visibleText: "Neue Protokoll-E-Mail",
  },
  {
    path: "/admin/project-record-templates",
    visibleText: "Vorlagen Protokolleinträge",
  },
  {
    path: "/admin/project-record-templates/new",
    visibleText: "Titel der Vorlage",
  },
  {
    path: "/admin/projects/rs23/subsections",
    visibleText: "Mehrere Planungsabschnitte erstellen",
  },
  {
    path: "/admin/projects/rs23/subsections/edit",
    visibleText: "Prozess zum Aktualisieren",
  },
  {
    path: "/admin/projects/rs23/subsections/multiple-new",
    visibleText: "Präfix-Id",
  },
] as const

test.describe("Admin page renders", () => {
  test.use({ storageState: authFile("admin") })
  test.use({ allowedConsoleErrors: pageNoise })

  for (const adminPage of adminPages) {
    test(`renders ${adminPage.path} — ${adminPage.visibleText} without console errors`, async ({
      page,
    }) => {
      let response = await page.goto(adminPage.path)
      if (!response?.ok()) {
        response = await page.goto(adminPage.path)
      }
      expect(response?.ok()).toBeTruthy()

      await expect(page.getByText(adminPage.visibleText, { exact: false }).first()).toBeVisible({
        timeout: 30_000,
      })
    })
  }
})

test.describe("Admin writes and validation", () => {
  test.describe.configure({ mode: "serial" })
  test.use({ storageState: authFile("admin") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("creates project record email and renders detail without console errors", async ({
    page,
  }) => {
    await page.goto("/admin/project-record-emails/new")

    await page.getByLabel("Body").fill("E2E smoke test email body")
    await page.getByRole("button", { name: "E-Mail speichern" }).click()

    await expect(page.getByRole("heading", { name: /Protokoll-E-Mail \d+/ })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByText("E2E smoke test email body").first()).toBeVisible()
  })

  test("shows validation errors on empty project create form", async ({ page }) => {
    await page.goto("/admin/projects/new")
    await assertFormValidationOnEmptySubmit({
      page,
      labels: ["Kürzel"],
      submitButtonName: "Erstellen",
      stayOnUrl: /\/admin\/projects\/new$/,
    })
  })

  test("renders user membership detail page", async ({ page }) => {
    await page.goto("/admin/memberships/1")
    await expect(page.getByRole("button", { name: "Speichern" })).toBeVisible({ timeout: 30_000 })
  })

  test("shows validation errors on empty survey create form", async ({ page }) => {
    await page.goto("/admin/surveys/new")
    await assertFormValidationOnEmptySubmit({
      page,
      labels: ["Slug", "Titel"],
      submitButtonName: "Erstellen",
      stayOnUrl: /\/admin\/surveys\/new$/,
    })
  })

  test("shows validation errors on empty project record email form", async ({ page }) => {
    await page.goto("/admin/project-record-emails/new")
    await assertFormValidationOnEmptySubmit({
      page,
      labels: ["Body"],
      submitButtonName: "E-Mail speichern",
      stayOnUrl: /\/admin\/project-record-emails\/new$/,
    })
  })

  test("renders bulk subsection create page with form", async ({ page }) => {
    const path = "/admin/projects/rs23/subsections/multiple-new"
    const response = await page.goto(path)
    expect(response?.ok()).toBeTruthy()

    await expect(
      page.getByRole("heading", { name: "Mehrere Planungsabschnitte erstellen" }),
    ).toBeVisible({ timeout: 30_000 })
    await expect(page.getByLabel("Präfix-Id")).toBeVisible()
    await expect(page.getByLabel("Anzahl")).toBeVisible()
    await expect(page.getByRole("button", { name: "Erstellen", exact: true })).toBeVisible()

    await page.getByLabel("Präfix-Id").fill("INVALID SPACE")
    await page.getByRole("button", { name: "Erstellen", exact: true }).click()
    await expect(page.getByRole("alert").filter({ hasText: "Erlaubte Zeichen" })).toBeVisible({
      timeout: 15_000,
    })
    await expect(page).toHaveURL(/\/admin\/projects\/rs23\/subsections\/multiple-new$/)
  })
})
