import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { pageNoise } from "@/tests/_fixtures/console-noise"
import { expect, test } from "@/tests/_fixtures/test"

const projectSlug = seedProjects.richProject

const projectPages = [
  { path: `/${projectSlug}`, heading: "RS23", title: /Projekt/ },
  { path: `/${projectSlug}/contacts`, heading: "Externe Kontakte", title: /Kontakte/ },
  { path: `/${projectSlug}/uploads`, heading: "Dokumente", title: /Dokumente/ },
  {
    path: `/${projectSlug}/project-records`,
    heading: "Projektprotokoll",
    title: /Projektprotokoll/,
  },
  { path: `/${projectSlug}/surveys`, heading: "Beteiligungen", title: /Beteiligungen/ },
  { path: `/${projectSlug}/operators`, heading: "Baulastträger", title: /Baulastträger/ },
  { path: `/${projectSlug}/quality-levels`, heading: "Ausbaustandards", title: /Ausbaustandards/ },
  { path: `/${projectSlug}/network-hierarchy`, heading: "Netzstufen", title: /Netzstufen/ },
  { path: `/${projectSlug}/subsection-status`, heading: "Status", title: /Status/ },
  { path: `/${projectSlug}/subsubsection-status`, heading: "Phase", title: /Phase/ },
] as const

test.describe("Project smoke", () => {
  test.describe.configure({ mode: "serial" })
  test.use({ storageState: authFile("viewer") })
  test.use({ allowedConsoleErrors: pageNoise })

  for (const projectPage of projectPages) {
    test(`renders ${projectPage.path}`, async ({ page }) => {
      await page.goto(projectPage.path)

      await expect(page).toHaveTitle(projectPage.title)
      await expect(
        page.getByRole("heading", { name: projectPage.heading, exact: true }),
      ).toBeVisible({
        timeout: 30_000,
      })
    })
  }
})
