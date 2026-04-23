import { seedProjects } from "@/tests/_fixtures/auth"
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
