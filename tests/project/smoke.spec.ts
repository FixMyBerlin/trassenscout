import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { uploadPageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"

const projectSlug = seedProjects.richProject

const projectPages = [
  { path: `/${projectSlug}`, heading: "RS23" },
  { path: `/${projectSlug}/contacts`, heading: "Externe Kontakte" },
  { path: `/${projectSlug}/uploads`, heading: "Dokumente" },
  { path: `/${projectSlug}/project-records`, heading: "Projektprotokoll" },
  { path: `/${projectSlug}/surveys`, heading: "Beteiligungen" },
  { path: `/${projectSlug}/operators`, heading: "Baulastträger" },
  { path: `/${projectSlug}/quality-levels`, heading: "Ausbaustandards" },
  { path: `/${projectSlug}/network-hierarchy`, heading: "Netzstufen" },
  { path: `/${projectSlug}/subsection-status`, heading: "Status" },
  { path: `/${projectSlug}/subsubsection-status`, heading: "Status" },
] as const

test.describe("Project smoke", () => {
  test.use({ storageState: authFile("viewer") })
  test.use({ allowedConsoleErrors: uploadPageNoise })

  for (const projectPage of projectPages) {
    test(`renders ${projectPage.path}`, async ({ page }) => {
      await page.goto(projectPage.path)

      await expect(
        page.getByRole("heading", { name: projectPage.heading, exact: true }),
      ).toBeVisible({
        timeout: 30_000,
      })
    })
  }
})
