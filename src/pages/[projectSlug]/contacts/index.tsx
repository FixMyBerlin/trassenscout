import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { TableCellsIcon } from "@heroicons/react/20/solid"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { ContactList } from "src/contacts/components/ContactList"
import getContacts from "src/contacts/queries/getContacts"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Pagination } from "src/core/components/Pagination"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"

const ITEMS_PER_PAGE = 100

export const ContactTable = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const projectSlug = useParam("projectSlug", "string")
  const [{ contacts, hasMore }] = usePaginatedQuery(getContacts, {
    projectSlug: projectSlug!,
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  if (!contacts.length) {
    return (
      <p className="text-center text-xl text-gray-500">
        <span>Es wurden noch keine Kontakte eingetragen.</span>
      </p>
    )
  }

  return (
    <div className="mt-8 flex flex-col">
      <ContactList contacts={contacts} />
      <div className="mt-6">
        <Pagination
          hasMore={hasMore}
          page={page}
          handlePrev={goToPreviousPage}
          handleNext={goToNextPage}
        />
      </div>
    </div>
  )
}

const ContactsPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")
  return (
    <LayoutRs>
      <MetaTags noindex title="Kontakte" />
      <div>
        <PageHeader
          title="Kontakte"
          description="Dieser Bereich hilft Ihnen dabei Kontakte zu verwalten und
        anzuschreiben."
          action={
            <Link button href={Routes.NewContactPage({ projectSlug: projectSlug! })}>
              Neuer Kontakt
            </Link>
          }
        />
        <Suspense fallback={<Spinner page />}>
          <ContactTable />
        </Suspense>
      </div>
    </LayoutRs>
  )
}

export default ContactsPage
