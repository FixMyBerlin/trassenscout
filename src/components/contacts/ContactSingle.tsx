import { LinkMail } from "@/src/components/core/components/links/LinkMail"
import { LinkTel } from "@/src/components/core/components/links/LinkTel"
import { Markdown } from "@/src/components/core/components/Markdown/Markdown"
import { TableWrapper } from "@/src/components/core/components/Table/TableWrapper"
import { getFullname } from "@/src/components/core/users/getFullname"
import { ProjectRecordTagsList } from "@/src/components/project-records/ProjectRecordTagsList"
import type { Contact } from "@/src/server/contacts/types"

type Props = {
  contact: Contact
}

export const ContactSingle: React.FC<Props> = ({ contact }) => {
  return (
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
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Tags
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
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
            <td className="px-3 py-4 text-sm text-gray-500">
              <ProjectRecordTagsList tags={contact.tags ?? []} />
            </td>
          </tr>
        </tbody>
      </table>

      {contact.note && (
        <div className="px-3 py-4 text-sm text-gray-500">
          <Markdown markdown={contact.note}></Markdown>
        </div>
      )}
    </TableWrapper>
  )
}
