import { TrashIcon } from "@heroicons/react/20/solid"
import { useSuspenseQuery } from "@tanstack/react-query"
import { twJoin } from "tailwind-merge"
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
import { ProjectRecordTagsList } from "@/src/components/project-records/ProjectRecordTagsList"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import type { Contact } from "@/src/server/contacts/types"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import {
  ContactTableFormSchema,
  contactTableFormDefaultValues,
} from "@/src/shared/contacts/schemas"
import { useContactsModal } from "./ContactsModalHost"

/**
 * Column width classes for `table-fixed` layout. Adjust percentages here only.
 */
const contactTableColWidths = {
  name: "min-w-0 w-[40%] @xl:w-[18%]",
  role: "hidden @xl:table-column @xl:w-[14%]",
  phone: "w-[30%] @xl:w-[14%]",
  email: "hidden @xl:table-column @xl:w-[20%]",
  tags: "hidden @xl:table-column @xl:w-[20%]",
  actions: "w-[30%] @xl:w-[14%]",
} as const

type Props = {
  contacts: Contact[]
  currentUserEmail?: string | null
  projectSlug: string
}

export const ContactTable = ({ contacts, currentUserEmail, projectSlug }: Props) => {
  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))
  const contactsModal = useContactsModal()
  const spaceClasses = "px-3 py-2"

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
      withPagePadding={false}
      className="space-y-0"
    >
      <form.AppField name="selectedContacts">
        {(field) => (
          <>
            <TableWrapper className="[&>div>div]:border-t-0">
              <div className="@container w-full">
                <table className="min-w-full table-fixed border-collapse text-left text-sm text-gray-700">
                  <colgroup>
                    <col className={contactTableColWidths.name} />
                    <col className={contactTableColWidths.role} />
                    <col className={contactTableColWidths.phone} />
                    <col className={contactTableColWidths.email} />
                    <col className={contactTableColWidths.tags} />
                    <col className={contactTableColWidths.actions} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <th scope="col" className={twJoin(spaceClasses, "font-medium uppercase")}>
                        Name
                      </th>
                      <th
                        scope="col"
                        className={twJoin(
                          spaceClasses,
                          "hidden font-medium uppercase @xl:table-cell",
                        )}
                      >
                        Position
                      </th>
                      <th scope="col" className={twJoin(spaceClasses, "font-medium uppercase")}>
                        Telefon
                      </th>
                      <th
                        scope="col"
                        className={twJoin(
                          spaceClasses,
                          "hidden font-medium uppercase @xl:table-cell",
                        )}
                      >
                        E-Mail
                      </th>
                      <th
                        scope="col"
                        className={twJoin(
                          spaceClasses,
                          "hidden font-medium uppercase @xl:table-cell",
                        )}
                      >
                        Tags
                      </th>
                      <th scope="col" className={twJoin(spaceClasses, "sr-only")}>
                        Aktionen
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {contacts.map((contact) => (
                      <tr key={contact.email} className="border-b border-gray-100">
                        <td className={twJoin(spaceClasses, "align-top")}>
                          <Link
                            className="w-full"
                            to={contactsModal.getContactDetailHref({ contactId: contact.id })}
                            resetScroll={false}
                          >
                            {getFullname(contact)}
                          </Link>
                        </td>
                        <td
                          className={twJoin(
                            "hidden align-top wrap-break-word @xl:table-cell",
                            spaceClasses,
                          )}
                        >
                          {contact.role || "—"}
                        </td>
                        <td className={twJoin(spaceClasses, "align-top whitespace-nowrap")}>
                          {contact.phone ? <LinkTel>{contact.phone}</LinkTel> : "—"}
                        </td>
                        <td
                          className={twJoin(
                            "hidden align-top whitespace-nowrap @xl:table-cell",
                            spaceClasses,
                          )}
                        >
                          <LinkMail subject="Abstimmung zum RS 8">{contact.email}</LinkMail>
                        </td>
                        <td className={twJoin("hidden align-top @xl:table-cell", spaceClasses)}>
                          <ProjectRecordTagsList tags={contact.tags ?? []} />
                        </td>
                        <td className={twJoin(spaceClasses, "align-top")}>
                          <div className="flex items-center justify-end gap-4">
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
              </div>
            </TableWrapper>

            <ButtonWrapper className="mt-6 justify-end px-4 sm:px-6 lg:px-8">
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
