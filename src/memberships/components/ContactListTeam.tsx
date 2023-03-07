import { PromiseReturnType } from "blitz"
import React from "react"
import { ContactListWrapper } from "src/contacts/components/ContactListWrapper"
import { LinkMail, LinkTel } from "src/core/components/links"
import { getFullname } from "src/users/utils"
import getUsersByProjectMembership from "../queries/getUsersByProjectMembership"

type Props = {
  contacts: PromiseReturnType<typeof getUsersByProjectMembership>
}

export const ContactListTeam: React.FC<Props> = ({ contacts }) => {
  return (
    <ContactListWrapper>
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
              Telefon
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              E-Mail
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {contacts.map((contact) => (
            <tr key={contact.email}>
              <td className="h-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                <div className="flex items-center font-medium text-gray-900">
                  {getFullname(contact) ? getFullname(contact) : <div className="pl-4">-</div>}
                </div>
              </td>

              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {contact.phone ? <LinkTel>{contact.phone}</LinkTel> : <div className="pl-4">-</div>}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <LinkMail subject="Abstimmung zum RS 8">{contact.email}</LinkMail>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ContactListWrapper>
  )
}
