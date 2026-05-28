import { seedProjects } from "@/tests/_fixtures/auth"
import { defineSettingsRoutePermissionSuite } from "./_shared/settingsRoutePermissions"

const projectSlug = seedProjects.richProject
const subsubsectionStatusPath = `/${projectSlug}/subsubsection-status`
const newSubsubsectionStatusPath = `${subsubsectionStatusPath}/new`

defineSettingsRoutePermissionSuite({
  suiteName: "Subsubsection status permissions",
  listPath: subsubsectionStatusPath,
  listHeading: "Phase",
  createPath: newSubsubsectionStatusPath,
  createHeading: "Phase hinzufügen",
  editHeading: "Phase bearbeiten",
  createLinkName: "Neue Phase",
})
