import { Form, LabeledCheckbox } from "@/src/core/components/forms"
import { Link, LinkMail, LinkTel, whiteButtonStyles } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/hooks"
import { IfUserCanEdit } from "@/src/memberships/components/IfUserCan"
import getProject from "@/src/projects/queries/getProject"
import { useCurrentUser } from "@/src/users/hooks/useCurrentUser"
import { getFullname } from "@/src/users/utils"
import { Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid"
import { Contact } from "@prisma/client"
import { useRouter } from "next/router"
import { useState } from "react"
import { TableWrapper } from "../../core/components/Table/TableWrapper"

type Props = {
  contacts: Contact[]
  withAction?: boolean
  withNotes?: boolean
}

export const ContactTable: React.FC<Props> = ({ contacts }) => {
  const [mailButtonActive, setMailButtonActive] = useState(false)
  const projectSlug = useProjectSlug()
  const router = useRouter()
  const user = useCurrentUser()
  const [project] = useQuery(getProject, { projectSlug })

  const handleSubmit = async ({ selectedContacts }: { selectedContacts: string[] | [] }) => {
    const selectedContactIds = selectedContacts.map(Number)

    const contactMailString = contacts
      .filter((contact) => selectedContactIds.includes(contact.id))
      .map((contact) => `"${getFullname(contact)}" <${contact.email}>`)
      .join(",")

    void router.push(
      `mailto:${user?.email}?bcc=${contactMailString}&subject=Infos zu ${shortTitle(project.slug)}`,
    )
  }

  const handleChange = (values: any) => {
    // when form values change check if at least one checkmark is set
    setMailButtonActive(
      Object.entries(values).filter((contact) => contact[1] === true).length !== 0,
    )
  }

  return (
    <Form className="mt-7" onSubmit={handleSubmit} onChange={handleChange}>
      <TableWrapper>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
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
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {contacts.map((contact) => (
              <tr key={contact.email}>
                <td className="h-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="flex items-center font-medium text-gray-900">
                    {getFullname(contact)}
                  </div>
                </td>
                <td className="break-words px-3 py-4 text-sm text-gray-500">{contact.role}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {contact.phone && <LinkTel>{contact.phone}</LinkTel>}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <LinkMail subject="Abstimmung zum RS 8">{contact.email}</LinkMail>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <Link
                    href={Routes.ShowContactPage({
                      projectSlug: projectSlug!,
                      contactId: contact.id,
                    })}
                  >
                    Details
                  </Link>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex items-center justify-end gap-4 text-right">
                    <IfUserCanEdit>
                      <Link
                        href={Routes.EditContactPage({
                          contactId: contact.id,
                          projectSlug: projectSlug!,
                        })}
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        <span className="sr-only">Bearbeiten</span>
                      </Link>
                    </IfUserCanEdit>
                    <Link
                      href={Routes.ShowContactPage({
                        contactId: contact.id,
                        projectSlug: projectSlug!,
                      })}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Link>
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
          <Link
            button="blue"
            icon="plus"
            href={Routes.NewContactPage({ projectSlug: projectSlug! })}
          >
            Kontakt
          </Link>
        </IfUserCanEdit>
        <button disabled={!mailButtonActive} className={whiteButtonStyles} type="submit">
          Mail schreiben
        </button>
      </ButtonWrapper>
    </Form>
  )
}
