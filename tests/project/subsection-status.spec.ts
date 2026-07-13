import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { test } from "@/tests/_fixtures/test"
import { assertFormValidationOnEmptySubmit } from "./_shared/formValidation"
import { defineSettingsRoutePermissionSuite, pageNoise } from "./_shared/settingsRoutePermissions"

const projectSlug = seedProjects.richProject
const subsectionStatusPath = `/${projectSlug}/subsection-status`
const newSubsectionStatusPath = `${subsectionStatusPath}/new`

defineSettingsRoutePermissionSuite({
  suiteName: "Subsection status permissions",
  listPath: subsectionStatusPath,
  listHeading: "Status",
  createPath: newSubsectionStatusPath,
  createHeading: "Status hinzufügen",
  editHeading: "Status bearbeiten",
  createLinkName: "Neuer Status",
})

test.describe("Subsection status form validation", () => {
  test.use({ storageState: authFile("editor") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto(newSubsectionStatusPath)
    await assertFormValidationOnEmptySubmit({
      page,
      labels: ["Kürzel", "Titel"],
      submitButtonName: "Erstellen",
      stayOnUrl: new RegExp(`${newSubsectionStatusPath}$`),
    })
  })
})
