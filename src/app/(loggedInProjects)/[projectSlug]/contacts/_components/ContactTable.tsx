"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { getFullname } from "@/src/app/_components/users/utils/getFullname"
import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import { Link, LinkMail, LinkTel, whiteButtonStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/core/components/text"
import { contactTableFormDefaultValues } from "@/src/server/contacts/schema"
import getProject from "@/src/server/projects/queries/getProject"
import { useQuery } from "@blitzjs/rpc"
import { TrashIcon } from "@heroicons/react/20/solid"
import { Contact } from "@prisma/client"
import { useStore } from "@tanstack/react-form"
import { Route } from "next"
import { useRouter } from "next/navigation"

type Props = {
  contacts: Contact[]
  currentUserEmail?: string | null
  projectSlug: string
}

export const ContactTable = ({ contacts, currentUserEmail, projectSlug }: Props) => {
  const router = useRouter()
  const [project] = useQuery(getProject, { projectSlug })

  const form = useAppForm({
    defaultValues: contactTableFormDefaultValues,
    onSubmit: async ({ value }) => {
      const selectedContactIds = value.selectedContacts.map(Number)

      const contactMailString = contacts
        .filter((contact) => selectedContactIds.includes(contact.id))
        .map((contact) => `"${getFullname(contact)}" <${contact.email}>`)
        .join(",")

      void router.push(
        `mailto:${currentUserEmail || ""}?bcc=${contactMailString}&subject=Infos zu ${shortTitle(project.slug)}`,
      )
    },
  })

  const selectedContacts = useStore(form.store, (state) => state.values.selectedContacts)
  const mailButtonActive = Array.isArray(selectedContacts) && selectedContacts.length > 0

  return (
    <FormShell form={form} formError={null} submitText="" hideSubmitButton className="mt-7">
      <TableWrapper>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Name
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Position
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Telefon
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                E-Mail
              </th>
              <th scope="col" className="sr-only">
                Details
              </th>
              <th scope="col" className="relative py-3.5 pr-4 pl-3 sm:pr-6">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>

          <form.AppField name="selectedContacts">
            {(field) => (
              <tbody className="divide-y divide-gray-200 bg-white">
                {contacts.map((contact) => (
                  <tr key={contact.email}>
                    <td className="h-20 py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                      <div className="flex items-center font-medium text-gray-900">
                        {getFullname(contact)}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm wrap-break-word text-gray-500">
                      {contact.role}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                      {contact.phone && <LinkTel>{contact.phone}</LinkTel>}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                      <LinkMail subject="Abstimmung zum RS 8">{contact.email}</LinkMail>
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                      <Link href={`/${projectSlug}/contacts/${contact.id}` as Route}>Details</Link>
                    </td>
                    <td className="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                      <div className="flex items-center justify-end gap-4 text-right">
                        <IfUserCanEdit>
                          <Link href={`/${projectSlug}/contacts/${contact.id}` as Route}>
                            <TrashIcon className="size-4" />
                          </Link>
                        </IfUserCanEdit>
                        <field.MultiCheckbox
                          value={String(contact.id)}
                          labelProps={{ className: "sr-only" }}
                          label="Markieren für 'Mail schreiben'"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </form.AppField>
        </table>
      </TableWrapper>

      <ButtonWrapper className="mt-6 justify-between">
        <IfUserCanEdit>
          <Link button="blue" icon="plus" href={`/${projectSlug}/contacts/table` as Route}>
            Kontakte hinzufügen & bearbeiten
          </Link>
        </IfUserCanEdit>
        <button
          disabled={!mailButtonActive}
          className={whiteButtonStyles}
          type="button"
          onClick={() => form.handleSubmit()}
        >
          Mail schreiben
        </button>
      </ButtonWrapper>
    </FormShell>
  )
}
