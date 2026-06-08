import { seedProjects } from "@/tests/_fixtures/auth"
import { defineSettingsRouteCrudSuite } from "./_shared/settingsRouteCrud"
import { defineSettingsRoutePermissionSuite } from "./_shared/settingsRoutePermissions"

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
