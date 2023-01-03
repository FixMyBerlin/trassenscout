import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import getDate from "src/dates/queries/getDate"
import deleteDate from "src/dates/mutations/deleteDate"
import { Link, linkStyles } from "src/core/components/links"
import clsx from "clsx"

export const Date = () => {
  const router = useRouter()
  const dateId = useParam("dateId", "number")
  const [deleteDateMutation] = useMutation(deleteDate)
  const [date] = useQuery(getDate, { id: dateId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${date.id} löschen?`)) {
      await deleteDateMutation({ id: date.id })
      await router.push(Routes.DatesPage())
    }
  }

  return (
    <>
      <MetaTags noindex title="Date {date.id}" />

      <div>
        <h1>Date {date.id}</h1>
        <pre>{JSON.stringify(date, null, 2)}</pre>

        <Link href={Routes.EditDatePage({ dateId: date.id })}>Bearbeiten</Link>

        <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
          Löschen
        </button>
      </div>
    </>
  )
}

const ShowDatePage = () => {
  return (
    <LayoutArticle>
      <p>
        <Link href={Routes.DatesPage()}>Dates</Link>
      </p>

      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <Date />
      </Suspense>
    </LayoutArticle>
  )
}

ShowDatePage.authenticate = true

export default ShowDatePage
