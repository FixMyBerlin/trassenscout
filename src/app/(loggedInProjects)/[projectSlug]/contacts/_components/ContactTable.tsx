"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { getFullname } from "@/src/app/_components/users/utils/getFullname"
import { Form, LabeledCheckbox } from "@/src/core/components/forms"
import { Link, LinkMail, LinkTel, whiteButtonStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { TableWrapper } from "@/src/core/components/Table/TableWrapper"
import { shortTitle } from "@/src/core/components/text"
import getProject from "@/src/server/projects/queries/getProject"
import { useQuery } from "@blitzjs/rpc"
import { TrashIcon } from "@heroicons/react/20/solid"
import { Contact } from "@prisma/client"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  contacts: Contact[]
  currentUserEmail?: string | null
  projectSlug: string
}

export const ContactTable = ({ contacts, currentUserEmail, projectSlug }: Props) => {
  const [mailButtonActive, setMailButtonActive] = useState(false)
  const router = useRouter()
  const [project] = useQuery(getProject, { projectSlug })

  const handleSubmit = async ({ selectedContacts }: { selectedContacts: string[] | [] }) => {
    const selectedContactIds = selectedContacts.map(Number)

    const contactMailString = contacts
      .filter((contact) => selectedContactIds.includes(contact.id))
      .map((contact) => `"${getFullname(contact)}" <${contact.email}>`)
      .join(",")

    void router.push(
      `mailto:${currentUserEmail || ""}?bcc=${contactMailString}&subject=Infos zu ${shortTitle(project.slug)}`,
    )
  }

  const handleChange = (values: any) => {
    // when form values change check if at least one checkmark is set
    setMailButtonActive(
      Object.entries(values).filter((contact) => contact[1] === true).length !== 0,
    )
  }

  return (
    <Form
      className="mt-7"
      onSubmit={handleSubmit}
      onChange={handleChange}
      submitText="Mail schreiben"
    >
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

          <tbody className="divide-y divide-gray-200 bg-white">
            {contacts.map((contact) => (
              <tr key={contact.email}>
                <td className="h-20 py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                  <div className="flex items-center font-medium text-gray-900">
                    {getFullname(contact)}
                  </div>
                </td>
                <td className="px-3 py-4 text-sm wrap-break-word text-gray-500">{contact.role}</td>
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
                        <TrashIcon className="h-4 w-4" />
                      </Link>
                    </IfUserCanEdit>
                    <LabeledCheckbox
                      scope="selectedContacts"
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
          <Link button="blue" icon="plus" href={`/${projectSlug}/contacts/table` as Route}>
            Kontakte hinzufügen & bearbeiten
          </Link>
        </IfUserCanEdit>
        <button disabled={!mailButtonActive} className={whiteButtonStyles} type="submit">
          Mail schreiben
        </button>
      </ButtonWrapper>
    </Form>
  )
}
