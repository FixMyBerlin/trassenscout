import { seedProjects } from "@/tests/_fixtures/auth"
import { defineSettingsRoutePermissionSuite } from "./_shared/settingsRoutePermissions"

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
