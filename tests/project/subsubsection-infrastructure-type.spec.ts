import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { test } from "@/tests/_fixtures/test"
import { assertFormValidationOnEmptySubmit } from "./_shared/formValidation"
import { defineSettingsRoutePermissionSuite, pageNoise } from "./_shared/settingsRoutePermissions"

const projectSlug = seedProjects.richProject
const subsubsectionInfrastructureTypePath = `/${projectSlug}/subsubsection-infrastructure-type`
const newSubsubsectionInfrastructureTypePath = `${subsubsectionInfrastructureTypePath}/new`

defineSettingsRoutePermissionSuite({
  suiteName: "Subsubsection infrastructure type permissions",
  listPath: subsubsectionInfrastructureTypePath,
  listHeading: "Infrastrukturtypen",
  createPath: newSubsubsectionInfrastructureTypePath,
  createHeading: "Infrastrukturtyp hinzufügen",
  editHeading: "Infrastrukturtyp bearbeiten",
  createLinkName: "Neuer Infrastrukturtyp",
})

test.describe("Subsubsection infrastructure type form validation", () => {
  test.use({ storageState: authFile("editor") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto(newSubsubsectionInfrastructureTypePath)
    await assertFormValidationOnEmptySubmit({
      page,
      labels: ["Kürzel", "Titel"],
      submitButtonName: "Erstellen",
      stayOnUrl: new RegExp(`${newSubsubsectionInfrastructureTypePath}$`),
    })
  })
})
