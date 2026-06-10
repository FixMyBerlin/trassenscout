import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { test } from "@/tests/_fixtures/test"
import { assertFormValidationOnEmptySubmit } from "./_shared/formValidation"
import { defineSettingsRoutePermissionSuite, pageNoise } from "./_shared/settingsRoutePermissions"

const projectSlug = seedProjects.richProject
const subsubsectionSpecialPath = `/${projectSlug}/subsubsection-special`
const newSubsubsectionSpecialPath = `${subsubsectionSpecialPath}/new`

defineSettingsRoutePermissionSuite({
  suiteName: "Subsubsection special permissions",
  listPath: subsubsectionSpecialPath,
  listHeading: "Besonderheiten",
  createPath: newSubsubsectionSpecialPath,
  createHeading: "Besonderheit hinzufügen",
  editHeading: "Besonderheit bearbeiten",
  createLinkName: "Neue Besonderheit",
})

test.describe("Subsubsection special form validation", () => {
  test.use({ storageState: authFile("editor") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto(newSubsubsectionSpecialPath)
    await assertFormValidationOnEmptySubmit({
      page,
      labels: ["Kürzel", "Titel"],
      submitButtonName: "Erstellen",
      stayOnUrl: new RegExp(`${newSubsubsectionSpecialPath}$`),
    })
  })
})
