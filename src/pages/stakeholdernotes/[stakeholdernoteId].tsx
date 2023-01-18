import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link, linkStyles } from "src/core/components/links"
import { quote } from "src/core/components/text"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import deleteStakeholdernote from "src/stakeholdernotes/mutations/deleteStakeholdernote"
import getStakeholdernote from "src/stakeholdernotes/queries/getStakeholdernote"

export const Stakeholdernote = () => {
  const router = useRouter()
  const stakeholdernoteId = useParam("stakeholdernoteId", "number")
  const [deleteStakeholdernoteMutation] = useMutation(deleteStakeholdernote)
  const [stakeholdernote] = useQuery(getStakeholdernote, { id: stakeholdernoteId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${stakeholdernote.id} unwiderruflich löschen?`)) {
      await deleteStakeholdernoteMutation({ id: stakeholdernote.id })
      await router.push(Routes.StakeholdernotesPage())
    }
  }

  return (
    <>
      <MetaTags noindex title={`Stakeholdernote ${quote(stakeholdernote.id)}`} />

      <h1>Stakeholdernote {quote(stakeholdernote.id)}</h1>
      <SuperAdminBox>
        <pre>{JSON.stringify(stakeholdernote, null, 2)}</pre>
      </SuperAdminBox>

      <Link href={Routes.EditStakeholdernotePage({ stakeholdernoteId: stakeholdernote.id })}>
        Bearbeiten
      </Link>

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
        Löschen
      </button>
    </>
  )
}

const ShowStakeholdernotePage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <Stakeholdernote />
      </Suspense>

      <p>
        <Link href={Routes.StakeholdernotesPage()}>Alle Stakeholdernotes</Link>
      </p>
    </LayoutArticle>
  )
}

ShowStakeholdernotePage.authenticate = true

export default ShowStakeholdernotePage
