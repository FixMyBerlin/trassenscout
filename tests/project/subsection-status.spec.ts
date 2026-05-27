import { seedProjects } from "@/tests/_fixtures/auth"
import { defineSettingsRoutePermissionSuite } from "./_shared/settingsRoutePermissions"

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
