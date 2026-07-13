import { authFile, seedProjects } from "@/tests/_fixtures/auth"
import { expect, test } from "@/tests/_fixtures/test"
import { assertFormValidationOnEmptySubmit } from "@/tests/project/_shared/formValidation"
import { defineSettingsRoutePermissionSuite } from "./_shared/settingsRoutePermissions"

const projectSlug = seedProjects.richProject
const contactsPath = `/${projectSlug}/contacts`
const newContactPath = `${contactsPath}/new`

defineSettingsRoutePermissionSuite({
  suiteName: "Contacts permissions",
  listPath: contactsPath,
  listHeading: "Externe Kontakte",
  createPath: newContactPath,
  createHeading: "Kontakt hinzufügen",
  editHeading: "Kontakt bearbeiten",
  createLinkName: "Neuer Kontakt",
})

test.describe("Contacts form validation", () => {
  test.use({ storageState: authFile("editor") })

  test("empty submit shows validation errors on create form", async ({ page }) => {
    await page.goto(newContactPath)
    await expect(
      page.getByRole("heading", { name: "Kontakt hinzufügen", exact: true }),
    ).toBeVisible({
      timeout: 30_000,
    })
    await assertFormValidationOnEmptySubmit({
      page,
      labels: ["Nachname", "E-Mail-Adresse"],
      submitButtonName: "Erstellen",
      stayOnUrl: new RegExp(`${newContactPath}$`),
    })
  })
})
