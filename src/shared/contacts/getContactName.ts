import { getFullname } from "@/src/components/core/users/getFullname"

type ContactNameSource = { firstName?: string | null; lastName?: string | null } | null

/** Every contact field is optional, so a contact can carry no name at all. */
export const getContactName = (contact: ContactNameSource) => getFullname(contact) || "Unbekannt"
