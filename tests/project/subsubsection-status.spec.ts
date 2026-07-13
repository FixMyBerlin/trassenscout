import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { test } from "@/tests/_fixtures/test"
import { assertFormValidationOnEmptySubmit } from "./_shared/formValidation"
import { defineSettingsRoutePermissionSuite, pageNoise } from "./_shared/settingsRoutePermissions"

const projectSlug = seedProjects.richProject
const subsubsectionStatusPath = `/${projectSlug}/subsubsection-status`
const newSubsubsectionStatusPath = `${subsubsectionStatusPath}/new`

defineSettingsRoutePermissionSuite({
  suiteName: "Subsubsection status permissions",
  listPath: subsubsectionStatusPath,
  listHeading: "Status",
  createPath: newSubsubsectionStatusPath,
  createHeading: "Status hinzufügen",
  editHeading: "Status bearbeiten",
  createLinkName: "Neuer Status",
})

test.describe("Subsubsection status form validation", () => {
  test.use({ storageState: authFile("editor") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto(newSubsubsectionStatusPath)
    await assertFormValidationOnEmptySubmit({
      page,
      labels: ["Kürzel", "Titel"],
      submitButtonName: "Erstellen",
      stayOnUrl: new RegExp(`${newSubsubsectionStatusPath}$`),
    })
  })
})
