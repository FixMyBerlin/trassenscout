import type { getContact, getContacts } from "./queries/contacts.server"

export type ContactsResult = Awaited<ReturnType<typeof getContacts>>
export type Contact = Awaited<ReturnType<typeof getContact>>
