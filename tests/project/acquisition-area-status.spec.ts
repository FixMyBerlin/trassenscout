import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { test } from "@/tests/_fixtures/test"
import { assertFormValidationOnEmptySubmit } from "./_shared/formValidation"
import { defineSettingsRoutePermissionSuite, pageNoise } from "./_shared/settingsRoutePermissions"

const projectSlug = seedProjects.richProject
const acquisitionAreaStatusPath = `/${projectSlug}/acquisition-area-status`
const newAcquisitionAreaStatusPath = `${acquisitionAreaStatusPath}/new`

defineSettingsRoutePermissionSuite({
  suiteName: "Acquisition area status permissions",
  listPath: acquisitionAreaStatusPath,
  listHeading: "Flächenerwerb-Status",
  createPath: newAcquisitionAreaStatusPath,
  createHeading: "Status hinzufügen",
  editHeading: "Status bearbeiten",
  createLinkName: "Neuer Status",
})

test.describe("Acquisition area status form validation", () => {
  test.use({ storageState: authFile("editor") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto(newAcquisitionAreaStatusPath)
    await assertFormValidationOnEmptySubmit({
      page,
      labels: ["Kürzel", "Titel"],
      submitButtonName: "Erstellen",
      stayOnUrl: new RegExp(`${newAcquisitionAreaStatusPath}$`),
    })
  })
})
