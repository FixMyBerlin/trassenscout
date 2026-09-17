import { seedProjects } from "@/tests/_fixtures/auth"
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
  createFromListUrl: new RegExp(`${contactsPath}\\?modalContactView=new$`),
  createFromListHeading: "Neuen Kontakt anlegen",
})
