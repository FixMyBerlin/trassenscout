import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { test } from "@/tests/_fixtures/test"
import { assertFormValidationOnEmptySubmit } from "./_shared/formValidation"
import { defineSettingsRoutePermissionSuite, pageNoise } from "./_shared/settingsRoutePermissions"

const projectSlug = seedProjects.richProject
const subsubsectionTaskPath = `/${projectSlug}/subsubsection-task`
const newSubsubsectionTaskPath = `${subsubsectionTaskPath}/new`

defineSettingsRoutePermissionSuite({
  suiteName: "Subsubsection task permissions",
  listPath: subsubsectionTaskPath,
  listHeading: "Aufgaben",
  createPath: newSubsubsectionTaskPath,
  createHeading: "Aufgabe hinzufügen",
  editHeading: "Aufgabe bearbeiten",
  createLinkName: "Neue Aufgabe",
})

test.describe("Subsubsection task form validation", () => {
  test.use({ storageState: authFile("editor") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto(newSubsubsectionTaskPath)
    await assertFormValidationOnEmptySubmit({
      page,
      labels: ["Kürzel", "Titel"],
      submitButtonName: "Erstellen",
      stayOnUrl: new RegExp(`${newSubsubsectionTaskPath}$`),
    })
  })
})
