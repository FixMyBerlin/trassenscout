import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { test } from "@/tests/_fixtures/test"
import { assertFormValidationOnEmptySubmit } from "./_shared/formValidation"
import { defineSettingsRoutePermissionSuite, pageNoise } from "./_shared/settingsRoutePermissions"

const projectSlug = seedProjects.richProject
const subsubsectionInfraPath = `/${projectSlug}/subsubsection-infra`
const newSubsubsectionInfraPath = `${subsubsectionInfraPath}/new`

defineSettingsRoutePermissionSuite({
  suiteName: "Subsubsection infra permissions",
  listPath: subsubsectionInfraPath,
  listHeading: "Infrastruktur",
  createPath: newSubsubsectionInfraPath,
  createHeading: "Infrastruktur hinzufügen",
  editHeading: "Infrastruktur bearbeiten",
  createLinkName: "Neue Infrastruktur",
})

test.describe("Subsubsection infra form validation", () => {
  test.use({ storageState: authFile("editor") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto(newSubsubsectionInfraPath)
    await assertFormValidationOnEmptySubmit({
      page,
      labels: ["Kürzel", "Titel"],
      submitButtonName: "Erstellen",
      stayOnUrl: new RegExp(`${newSubsubsectionInfraPath}$`),
    })
  })
})
