import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { test } from "@/tests/_fixtures/test"
import { assertFormValidationOnEmptySubmit } from "./_shared/formValidation"
import { defineSettingsRoutePermissionSuite, pageNoise } from "./_shared/settingsRoutePermissions"

const projectSlug = seedProjects.richProject
const networkHierarchyPath = `/${projectSlug}/network-hierarchy`
const newNetworkHierarchyPath = `${networkHierarchyPath}/new`

defineSettingsRoutePermissionSuite({
  suiteName: "Network hierarchy permissions",
  listPath: networkHierarchyPath,
  listHeading: "Netzstufen",
  createPath: newNetworkHierarchyPath,
  createHeading: "Netzstufe hinzufügen",
  editHeading: "Netzstufe bearbeiten",
  createLinkName: "Neue Netzstufe",
})

test.describe("Network hierarchy form validation", () => {
  test.use({ storageState: authFile("editor") })
  test.use({ allowedConsoleErrors: pageNoise })

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.goto(newNetworkHierarchyPath)
    await assertFormValidationOnEmptySubmit({
      page,
      labels: ["Kürzel", "Titel"],
      submitButtonName: "Erstellen",
      stayOnUrl: new RegExp(`${newNetworkHierarchyPath}$`),
    })
  })
})
