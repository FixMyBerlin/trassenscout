import { TrashIcon } from "@heroicons/react/20/solid"
import { useSuspenseQuery } from "@tanstack/react-query"
import { secondaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { Link } from "@/src/components/core/components/links/Link"
import { LinkMail } from "@/src/components/core/components/links/LinkMail"
import { LinkTel } from "@/src/components/core/components/links/LinkTel"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { getFullname } from "@/src/components/core/users/getFullname"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import type { Contact } from "@/src/prisma/generated/browser"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import {
  ContactTableFormSchema,
  contactTableFormDefaultValues,
} from "@/src/shared/contacts/schemas"

type Props = {
  contacts: Contact[]
  currentUserEmail?: string | null
  projectSlug: string
}

export const ContactTable = ({ contacts, currentUserEmail, projectSlug }: Props) => {
  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))

  const form = useAppForm({
    defaultValues: contactTableFormDefaultValues,
    validators: { onSubmit: ContactTableFormSchema } as never,
    onSubmit: async ({ value }) => {
      const selectedContactIds = value.selectedContacts.map(Number)

      const contactMailString = contacts
        .filter((contact) => selectedContactIds.includes(contact.id))
        .map((contact) => `"${getFullname(contact)}" <${contact.email}>`)
        .join(",")

      const mailtoUrl = `mailto:${currentUserEmail || ""}?bcc=${contactMailString}&subject=Infos zu ${shortTitle(project.slug)}`
      const anchor = document.createElement("a")
      anchor.href = mailtoUrl
      anchor.rel = "noopener noreferrer"
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
    },
  })

  return (
    <FormShell
      form={form}
      formError={null}
      submitText="Mail schreiben"
      hideSubmitButton
      className="mt-7 space-y-0"
    >
      <form.AppField name="selectedContacts">
        {(field) => (
          <>
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
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Position
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Telefon
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
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
                        <Link to={`/${projectSlug}/contacts/${contact.id}`}>Details</Link>
                      </td>
                      <td className="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                        <div className="flex items-center justify-end gap-4 text-right">
                          <IfUserCanEdit>
                            <Link to={`/${projectSlug}/contacts/${contact.id}`}>
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
              </table>
            </TableWrapper>

            <ButtonWrapper className="mt-6 justify-between">
              <IfUserCanEdit>
                <Link button="blue" icon="plus" to={`/${projectSlug}/contacts/table`}>
                  Kontakte hinzufügen & bearbeiten
                </Link>
              </IfUserCanEdit>
              <form.Subscribe
                selector={(state) =>
                  [state.values.selectedContacts.length, state.isSubmitting] as const
                }
              >
                {([selectedCount, isSubmitting]) => (
                  <button
                    disabled={selectedCount === 0 || isSubmitting}
                    className={secondaryButtonClassName}
                    type="submit"
                  >
                    {isSubmitting ? "…" : "Mail schreiben"}
                  </button>
                )}
              </form.Subscribe>
            </ButtonWrapper>
          </>
        )}
      </form.AppField>
    </FormShell>
  )
}
