import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { test } from "@/tests/_fixtures/test"
import { assertFormValidationOnEmptySubmit } from "./_shared/formValidation"
import { defineSettingsRouteCrudSuite } from "./_shared/settingsRouteCrud"
import { defineSettingsRoutePermissionSuite, pageNoise } from "./_shared/settingsRoutePermissions"

const projectSlug = seedProjects.richProject
const operatorsPath = `/${projectSlug}/operators`
const newOperatorPath = `${operatorsPath}/new`

defineSettingsRoutePermissionSuite({
  suiteName: "Operators permissions",
  listPath: operatorsPath,
  listHeading: "Baulastträger",
  createPath: newOperatorPath,
  createHeading: "Baulastträger hinzufügen",
  editHeading: "Baulastträger bearbeiten",
  createLinkName: "Neuer Baulastträger",
})

defineSettingsRouteCrudSuite({
  suiteName: "Operators CRUD persistence",
  listPath: operatorsPath,
  listHeading: "Baulastträger",
  createLinkName: "Neuer Baulastträger",
  createHeading: "Baulastträger hinzufügen",
  editHeading: "Baulastträger bearbeiten",
  slugLabel: "Kürzel",
  titleLabel: "Titel",
  createSubmitText: "Erstellen",
  editSubmitText: "Speichern",
})

test.describe("Operators form validation", () => {
  test.use({ storageState: authFile("editor") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto(newOperatorPath)
    await assertFormValidationOnEmptySubmit({
      page,
      labels: ["Kürzel", "Titel"],
      submitButtonName: "Erstellen",
      stayOnUrl: new RegExp(`${newOperatorPath}$`),
    })
  })
})
