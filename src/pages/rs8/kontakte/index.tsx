import { BlitzPage, Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/router"
import { Suspense } from "react"
import getContacts from "src/contacts/queries/getContacts"
import { buttonStyles, Link, LinkMail, LinkTel } from "src/core/components/links"
import { LayoutRs8, MetaTags } from "src/core/layouts"
import { Pagination } from "src/core/components/Pagination"
import { PageHeader } from "src/core/components/PageHeader"
import { ContactList } from "src/contacts/components/ContactList"

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
      <ContactList contacts={contacts} />
      <div className="mt-6">
        <Pagination
          visible={hasMore || page !== 0}
          disablePrev={page === 0}
          disableNext={!hasMore}
          handlePrev={goToPreviousPage}
          handleNext={goToNextPage}
        />
      </div>
    </div>
  )
}

const ContactsPage: BlitzPage = () => {
  return (
    <LayoutRs8>
      <MetaTags noindex title="Kontakte" />
      <div>
        <PageHeader
          title="Kontakte"
          description="Dieser Bereich hilft Ihnen dabei wichtige Kontakte zu verwalten und
        anzuschreiben."
          action={
            <Link button href={Routes.NewContactPage()}>
              Neuer Kalendereintrag
            </Link>
          }
        />
        <Suspense fallback={<div>Daten werden geladen…</div>}>
          <ContactTable />
        </Suspense>
      </div>
    </LayoutRs8>
  )
}

export default ContactsPage
