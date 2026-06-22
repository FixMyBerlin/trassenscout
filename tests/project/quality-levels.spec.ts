import { seedProjects } from "@/tests/_fixtures/auth"
import { defineSettingsRouteCrudSuite } from "./_shared/settingsRouteCrud"
import { defineSettingsRoutePermissionSuite } from "./_shared/settingsRoutePermissions"

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
