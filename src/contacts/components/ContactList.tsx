import { Routes, useParam } from "@blitzjs/next"
import { PencilSquareIcon, TableCellsIcon, TrashIcon } from "@heroicons/react/20/solid"
import { Contact } from "@prisma/client"
import React from "react"
import { Link, LinkMail, LinkTel } from "src/core/components/links"
import { getFullname } from "src/users/utils"

type Props = {
  contacts: Contact[]
  withAction?: boolean
  withNotes?: boolean
}

export const ContactList: React.FC<Props> = ({ contacts, withAction = true, withNotes = true }) => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
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
                {withNotes && (
                  <th scope="col" className="sr-only">
                    Details
                  </th>
                )}
                {withAction && (
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Edit</span>
                  </th>
                )}
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

                  {withNotes && contact.note ? (
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
                  ) : (
                    withNotes && <td className="sr-only">Keine Details</td>
                  )}
                  {withAction && (
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <p className="flex items-center justify-end gap-4 text-right">
                        <Link
                          href={Routes.EditContactPage({
                            contactId: contact.id,
                            projectSlug: projectSlug!,
                          })}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          <span className="sr-only">Bearbeiten</span>
                        </Link>
                        <Link
                          href={Routes.ShowContactPage({
                            contactId: contact.id,
                            projectSlug: projectSlug!,
                          })}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Link>
                      </p>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
