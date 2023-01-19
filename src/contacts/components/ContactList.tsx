import { Routes, useParam } from "@blitzjs/next"
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid"
import { Contact } from "@prisma/client"
import React from "react"
import { Link, LinkMail, LinkTel } from "src/core/components/links"

type Props = {
  contacts: Contact[]
  withAction?: boolean
}

export const ContactList: React.FC<Props> = ({ contacts, withAction = true }) => {
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
                  Titel & Position
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
                      {contact.firstName ? contact.firstName + " " : ""}
                      {contact.lastName}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="text-gray-900">{contact.title}</div>
                    <div className="text-gray-500">{contact.role}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {contact.phone && <LinkTel>{contact.phone}</LinkTel>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <LinkMail subject="Abstimmung zum RS 8">{contact.email}</LinkMail>
                  </td>
                  {withAction && (
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <p className="flex items-center justify-end gap-4 text-right">
                        <Link
                          button
                          href={Routes.EditContactPage({
                            contactId: contact.id,
                            projectSlug: projectSlug!,
                          })}
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                          <span className="sr-only">Bearbeiten</span>
                        </Link>
                        <Link
                          href={Routes.ShowContactPage({
                            contactId: contact.id,
                            projectSlug: projectSlug!,
                          })}
                        >
                          <TrashIcon className="h-5 w-5" />
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
