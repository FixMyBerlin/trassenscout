import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateContactSchema,
  DeleteContactSchema,
  GetContactSchema,
  GetContactsSchema,
  UpdateContactSchema,
} from "@/src/shared/contacts/schemas"
import { createContact, deleteContact, updateContact } from "./mutations/contacts.server"
import { getContact, getContacts } from "./queries/contacts.server"
export const getContactsFn = createServerFn({ method: "GET" })
  .inputValidator(GetContactsSchema)
  .handler(({ data }) => getContacts(getRequestHeaders(), data))

export const getContactFn = createServerFn({ method: "GET" })
  .inputValidator(GetContactSchema)
  .handler(({ data }) => getContact(getRequestHeaders(), data))

export const createContactFn = createServerFn({ method: "POST" })
  .inputValidator(CreateContactSchema)
  .handler(({ data }) => createContact(getRequestHeaders(), data))

export const updateContactFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateContactSchema)
  .handler(({ data }) => updateContact(getRequestHeaders(), data))

export const deleteContactFn = createServerFn({ method: "POST" })
  .inputValidator(DeleteContactSchema)
  .handler(({ data }) => deleteContact(getRequestHeaders(), data))
