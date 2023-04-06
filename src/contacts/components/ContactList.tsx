import { Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid"
import { Contact } from "@prisma/client"
import { AuthenticationError } from "blitz"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { Form, FORM_ERROR, LabeledCheckbox } from "src/core/components/forms"
import { Link, LinkMail, LinkTel, whiteButtonStyles } from "src/core/components/links"
import SurveyForm from "src/participation/components/form/SurveyForm"
import getProject from "src/projects/queries/getProject"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import { getFullname } from "src/users/utils"
import { ContactListWrapper } from "./ContactListWrapper"

type Props = {
  contacts: Contact[]
  withAction?: boolean
  withNotes?: boolean
}

export const ContactList: React.FC<Props> = ({ contacts }) => {
  const [isChecked, setIsChecked] = useState(false)
  const projectSlug = useParam("projectSlug", "string")
  const router = useRouter()
  const user = useCurrentUser()
  const [project] = useQuery(getProject, { slug: projectSlug })

  const handleSubmit = async (values: any) => {
    // get an array of contact ids - where checkbox is checked
    const participantsIds = Object.entries(values)
      .filter((contact) => contact[1] === true)
      .map((contact) => Number(contact[0]))
    // get a string of all email adresses, seperated by a comma
    const participants = contacts
      .filter((contact) => participantsIds.includes(contact.id))
      .map((contact) => contact.email)
      .join(",")

    void router.push(`mailto:${user?.email}?bcc=${participants}&subject=Infos zu ${project.title}`)
  }

  const handleChange = (values: any) => {
    // when form values change check if at least one checkmark is set
    setIsChecked(Object.entries(values).filter((contact) => contact[1] === true).length !== 0)
  }

  return (
    <SurveyForm onSubmit={handleSubmit} onChangeValues={handleChange}>
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
                    <LabeledCheckbox name={String(contact.id)} label={""} /> {getFullname(contact)}
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
              </tr>
            ))}
          </tbody>
        </table>
      </ContactListWrapper>
      <button disabled={!isChecked} className={whiteButtonStyles} type="submit">
        Mail senden
      </button>
    </SurveyForm>
  )
}
