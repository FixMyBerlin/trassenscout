import { Routes, useRouterQuery } from "@blitzjs/next"
import { Stakeholdernote } from "@prisma/client"
import React from "react"
import { useRouter } from "next/router"
import { StakeholderSectionListItemStatus } from "./StakeholderSectionListItemStatus"
import { Disclosure } from "src/core/components/Disclosure"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Link } from "src/core/components/links"
import { useSlugs } from "src/core/hooks"

type Props = {
  stakeholderNote: Stakeholdernote
}

export const StakeholderSectionListItem: React.FC<Props> = ({ stakeholderNote }) => {
  const { projectSlug, subsectionSlug } = useSlugs()

  const router = useRouter()
  const handleOpen = () => {
    router.query.stakeholderDetails = String(stakeholderNote.id)
    void router.push({ query: router.query }, undefined, { scroll: false })
  }
  const handleClose = () => {
    delete router.query.stakeholderDetails
    void router.push({ query: router.query }, undefined, { scroll: false })
  }

  // Open Disclored for object ID `stakeholderDetails`
  const params = useRouterQuery()
  const paramsStakeholderDetails = parseInt(String(params.stakeholderDetails))
  const open = stakeholderNote.id === paramsStakeholderDetails

  return (
    <Disclosure
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      classNameButton="py-4 text-left text-sm text-gray-900 hover:bg-gray-50"
      classNamePanel="pb-3"
      button={
        <div className="flex">
          <div className="w-52 flex-none pb-2 pl-4 pr-3 pt-3 sm:w-64 sm:pl-6">
            <StakeholderSectionListItemStatus status={stakeholderNote.status} />
          </div>
          <div className="flex grow items-center px-3 pb-2 pt-3 font-medium text-blue-500">
            <strong>{stakeholderNote.title}</strong>
          </div>
        </div>
      }
    >
      <div className="ml-3 px-3 pb-2 pt-6 sm:ml-64">
        {!stakeholderNote.statusText ? (
          <p className="text-gray-300">Für diesen Termin liegen keine Details vor.</p>
        ) : (
          <Markdown className="prose-sm mt-3" markdown={stakeholderNote.statusText} />
        )}
        <p className="mt-6 italic">
          Letzte Aktualisierung: {stakeholderNote.updatedAt.toLocaleDateString()}
        </p>
        <p className="mt-6">
          <Link
            icon="edit"
            href={Routes.EditStakeholdernotePage({
              projectSlug: projectSlug!,
              subsectionSlug: subsectionSlug!,
              stakeholdernoteId: stakeholderNote.id,
            })}
          >
            Bearbeiten
          </Link>
        </p>
      </div>
    </Disclosure>
  )
}
