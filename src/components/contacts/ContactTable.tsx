import { useSuspenseQuery } from "@tanstack/react-query"
import { twJoin } from "tailwind-merge"
import { whiteButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { ButtonWrapper } from "@/src/components/core/components/links/ButtonWrapper"
import { Link } from "@/src/components/core/components/links/Link"
import { LinkMail } from "@/src/components/core/components/links/LinkMail"
import { LinkTel } from "@/src/components/core/components/links/LinkTel"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { SortableTableHeader } from "@/src/components/core/components/Table/SortableTableHeader"
import {
  tableBodyClassName,
  tableCellClassName,
  tableColumnTiers,
  tableFixedClassName,
  tableHeadCellClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { getFullname } from "@/src/components/core/users/getFullname"
import { ProjectRecordTagsList } from "@/src/components/project-records/ProjectRecordTagsList"
import type { Contact } from "@/src/server/contacts/types"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { getContactName } from "@/src/shared/contacts/getContactName"
import {
  ContactTableFormSchema,
  contactTableFormDefaultValues,
} from "@/src/shared/contacts/schemas"
import type { ContactTableSortColumn } from "@/src/shared/contacts/searchSchemas"
import { type SortValues, sortRows } from "@/src/shared/tableSort/sortRows"
import type { TableSort } from "@/src/shared/tableSort/tableSort"
import { useContactsModal } from "./ContactsModalHost"
import { ContactTableDelete } from "./ContactTableDelete"

/**
 * Column width classes for `table-fixed` layout. Adjust percentages here only.
 */
const contactTableColWidths = {
  name: "min-w-0 w-[50%] @xl:w-[18%]",
  role: `${tableColumnTiers.from1024.col} @xl:w-[14%]`,
  phone: `${tableColumnTiers.from576.col} @xl:w-[14%]`,
  email: `${tableColumnTiers.from1024.col} @xl:w-[20%]`,
  tags: `${tableColumnTiers.from1024.col} @xl:w-[20%]`,
  actions: "w-[50%] @xl:w-[14%]",
} as const

const contactSortValues: SortValues<Contact, ContactTableSortColumn> = {
  name: (contact) => getFullname(contact),
}

type Props = {
  contacts: Contact[]
  currentUserEmail?: string | null
  onTagClick?: (tag: string) => void
  projectSlug: string
  sort?: TableSort<ContactTableSortColumn>
  onSortClick?: (column: ContactTableSortColumn) => void
}

export const ContactTable = ({
  contacts,
  currentUserEmail,
  onTagClick,
  projectSlug,
  sort,
  onSortClick,
}: Props) => {
  const { data: project } = useSuspenseQuery(projectBySlugQueryOptions(projectSlug))
  const contactsModal = useContactsModal()

  const form = useAppForm({
    defaultValues: contactTableFormDefaultValues,
    validators: { onSubmit: ContactTableFormSchema } as never,
    onSubmit: async ({ value }) => {
      const selectedContactIds = value.selectedContacts.map(Number)

      const contactMailString = contacts
        .filter((contact) => selectedContactIds.includes(contact.id) && contact.email)
        .map((contact) => `"${getContactName(contact)}" <${contact.email}>`)
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
      submitText="E-Mail schreiben"
      hideSubmitButton
      className="space-y-0 p-0"
      backLink={null}
    >
      <form.AppField name="selectedContacts">
        {(field) => (
          <>
            <TableWrapper className="@container">
              <div className="w-full">
                <table className={tableFixedClassName}>
                  <colgroup>
                    <col className={contactTableColWidths.name} />
                    <col className={contactTableColWidths.role} />
                    <col className={contactTableColWidths.phone} />
                    <col className={contactTableColWidths.email} />
                    <col className={contactTableColWidths.tags} />
                    <col className={contactTableColWidths.actions} />
                  </colgroup>
                  <thead>
                    <tr className={tableHeadRowClassName}>
                      <SortableTableHeader column="name" sort={sort} onSortClick={onSortClick}>
                        Name
                      </SortableTableHeader>
                      <th
                        scope="col"
                        className={twJoin(tableHeadCellClassName, tableColumnTiers.from1024.cell)}
                      >
                        Position
                      </th>
                      <th
                        scope="col"
                        className={twJoin(tableHeadCellClassName, tableColumnTiers.from576.cell)}
                      >
                        Telefon
                      </th>
                      <th
                        scope="col"
                        className={twJoin(tableHeadCellClassName, tableColumnTiers.from1024.cell)}
                      >
                        E-Mail
                      </th>
                      <th
                        scope="col"
                        className={twJoin(tableHeadCellClassName, tableColumnTiers.from1024.cell)}
                      >
                        Tags
                      </th>
                      <th scope="col" className={twJoin(tableHeadCellClassName, "sr-only")}>
                        Aktionen
                      </th>
                    </tr>
                  </thead>

                  <tbody className={tableBodyClassName}>
                    {sortRows(contacts, contactSortValues, sort).map((contact) => (
                      <tr key={contact.id} className={tableRowClassName}>
                        <td className={twJoin(tableCellClassName, "align-middle")}>
                          <Link
                            className="w-full"
                            to={contactsModal.getContactDetailHref({ contactId: contact.id })}
                            resetScroll={false}
                          >
                            {getContactName(contact)}
                          </Link>
                        </td>
                        <td
                          className={twJoin(
                            "align-middle wrap-break-word",
                            tableColumnTiers.from1024.cell,
                            tableCellClassName,
                          )}
                        >
                          {contact.role || "—"}
                        </td>
                        <td
                          className={twJoin(
                            tableCellClassName,
                            "align-middle whitespace-nowrap",
                            tableColumnTiers.from576.cell,
                          )}
                        >
                          {contact.phone ? <LinkTel>{contact.phone}</LinkTel> : "—"}
                        </td>
                        <td
                          className={twJoin(
                            "align-middle whitespace-nowrap",
                            tableColumnTiers.from1024.cell,
                            tableCellClassName,
                          )}
                        >
                          {contact.email ? (
                            <LinkMail subject="Abstimmung zum RS 8">{contact.email}</LinkMail>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td
                          className={twJoin(
                            "align-middle",
                            tableColumnTiers.from1024.cell,
                            tableCellClassName,
                          )}
                        >
                          <ProjectRecordTagsList
                            tags={contact.tags ?? []}
                            isInteractive={Boolean(onTagClick)}
                            onTagClick={onTagClick}
                          />
                        </td>
                        <td
                          className={twJoin("align-middle text-sm font-medium", tableCellClassName)}
                        >
                          <div className="flex flex-col items-end gap-1">
                            <field.MultiCheckbox
                              value={String(contact.id)}
                              outerProps={{ className: "justify-end" }}
                              label="Markieren für 'E-Mail schreiben'"
                            />
                            <ContactTableDelete
                              contactId={contact.id}
                              projectSlug={projectSlug}
                              contactTitle={getContactName(contact)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TableWrapper>

            <div className="w-full border-b border-gray-200">
              <ButtonWrapper className={twJoin("justify-end", pageContentPaddingClassName)}>
                <form.Subscribe
                  selector={(state) => [state.values.selectedContacts, state.isSubmitting] as const}
                >
                  {([selectedContacts, isSubmitting]) => {
                    const contactIds = contacts.map((contact) => String(contact.id))
                    const visibleSelectedCount = contactIds.filter((contactId) =>
                      selectedContacts.includes(contactId),
                    ).length
                    const allContactsSelected =
                      contactIds.length > 0 &&
                      contactIds.every((contactId) => selectedContacts.includes(contactId))

                    return (
                      <>
                        <button
                          disabled={contactIds.length === 0 || allContactsSelected || isSubmitting}
                          className={whiteButtonClassName}
                          type="button"
                          onClick={() =>
                            field.handleChange(
                              Array.from(new Set([...selectedContacts, ...contactIds])),
                            )
                          }
                        >
                          Alle markieren
                        </button>
                        <button
                          disabled={visibleSelectedCount === 0 || isSubmitting}
                          className={whiteButtonClassName}
                          type="submit"
                        >
                          {isSubmitting ? "…" : "E-Mail schreiben"}
                        </button>
                      </>
                    )
                  }}
                </form.Subscribe>
              </ButtonWrapper>
            </div>
          </>
        )}
      </form.AppField>
    </FormShell>
  )
}
