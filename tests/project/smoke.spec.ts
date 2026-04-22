import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { expect, test } from "@/tests/_fixtures/test"

const projectSlug = seedProjects.richProject

const projectPages = [
  { path: `/${projectSlug}`, heading: "RS23", title: /Projekt/ },
  { path: `/${projectSlug}/contacts`, heading: "Externe Kontakte", title: /Kontakte/ },
  { path: `/${projectSlug}/uploads`, heading: "Dokumente", title: /Dokumente/ },
] as const

test.describe("Project smoke", () => {
  test.describe.configure({ mode: "serial" })
  test.use({ storageState: authFile("viewer") })
  test.use({
    allowedConsoleErrors: [
      "webglcontextcreationerror",
      "Failed to initialize WebGL",
      "Failed to fetch RSC payload",
    ],
  })

  for (const projectPage of projectPages) {
    test(`renders ${projectPage.path}`, async ({ page }) => {
      await page.goto(projectPage.path)

      await expect(page).toHaveTitle(projectPage.title)
      await expect(page.getByRole("heading", { name: projectPage.heading, exact: true })).toBeVisible({
        timeout: 30_000,
      })
    })
  }
})
