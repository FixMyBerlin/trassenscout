import { BlitzPage, Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import getContacts from "src/contacts/queries/getContacts"
import { buttonStyles, Link, LinkMail, LinkTel } from "src/core/components/links"
import { LayoutRs8, MetaTags } from "src/core/layouts"

const ITEMS_PER_PAGE = 100

export const ContactTable = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ contacts, hasMore }] = usePaginatedQuery(getContacts, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  // TODO J - gehört jetzt woanders hin
  // if (!contacts.length) {
  //   return (
  //     <p className="flex flex-col gap-3 text-center text-xl text-gray-500">
  //       <TableCellsIcon className="h-10 w-10 self-center" />
  //       <span>Es wurden noch keine Kontakte eingetragen</span>
  //     </p>
  //   )
  // }

  return (
    <div className="mt-8 flex flex-col">
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
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {contacts.map((person) => (
                  <tr key={person.email}>
                    <td className="h-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center font-medium text-gray-900">
                        {person.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="text-gray-900">{person.title}</div>
                      <div className="text-gray-500">{person.role}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {person.phone && <LinkTel>{person.phone}</LinkTel>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <LinkMail subject="Abstimmung zum RS 8">{person.email}</LinkMail>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link
                        href={Routes.EditContactPage({ contactId: person.id })}
                        className={buttonStyles}
                      >
                        Edit<span className="sr-only">, {person.name}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TODO - anpassen wie bei Termine */}
      {/* <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button> */}
    </div>
  )
}

const ContactsPage: BlitzPage = () => {
  return (
    <LayoutRs8>
      <MetaTags noindex title="Kontakte" />
      <div>
        <Suspense fallback={<div>Daten werden geladen…</div>}>
          <ContactTable />
        </Suspense>
        <div className="mt-10">
          <Link className={buttonStyles} href={Routes.NewContactPage()}>
            Neuen Kontakt erstellen
          </Link>
        </div>
      </div>
    </LayoutRs8>
  )
}

export default ContactsPage
