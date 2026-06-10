import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { test } from "@/tests/_fixtures/test"
import { assertFormValidationOnEmptySubmit } from "./_shared/formValidation"
import { defineSettingsRouteCrudSuite } from "./_shared/settingsRouteCrud"
import { defineSettingsRoutePermissionSuite, pageNoise } from "./_shared/settingsRoutePermissions"

const projectSlug = seedProjects.richProject
const qualityLevelsPath = `/${projectSlug}/quality-levels`
const newQualityLevelPath = `${qualityLevelsPath}/new`

defineSettingsRoutePermissionSuite({
  suiteName: "Quality levels permissions",
  listPath: qualityLevelsPath,
  listHeading: "Ausbaustandards",
  createPath: newQualityLevelPath,
  createHeading: "Ausbaustandard hinzufügen",
  editHeading: "Ausbaustandard bearbeiten",
  createLinkName: "Neuer Ausbaustandard",
})

defineSettingsRouteCrudSuite({
  suiteName: "Quality levels CRUD persistence",
  listPath: qualityLevelsPath,
  listHeading: "Ausbaustandards",
  createLinkName: "Neuer Ausbaustandard",
  createHeading: "Ausbaustandard hinzufügen",
  editHeading: "Ausbaustandard bearbeiten",
  slugLabel: "Kürzel",
  titleLabel: "Titel",
  createSubmitText: "Erstellen",
  editSubmitText: "Speichern",
})

test.describe("Quality levels form validation", () => {
  test.use({ storageState: authFile("editor") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto(newQualityLevelPath)
    await assertFormValidationOnEmptySubmit({
      page,
      labels: ["Kürzel", "Titel"],
      submitButtonName: "Erstellen",
      stayOnUrl: new RegExp(`${newQualityLevelPath}$`),
    })
  })
})
