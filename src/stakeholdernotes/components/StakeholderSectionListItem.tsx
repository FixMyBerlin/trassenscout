import { Routes } from "@blitzjs/next"
import { Stakeholdernote } from "@prisma/client"
import React from "react"
import { Disclosure } from "src/core/components/Disclosure"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { Link } from "src/core/components/links"
import { useSlugs } from "src/core/hooks"
import { StakeholderSectionListItemStatus } from "./StakeholderSectionListItemStatus"

type Props = {
  stakeholderNote: Stakeholdernote
}

export const StakeholderSectionListItem: React.FC<Props> = ({ stakeholderNote }) => {
  const { projectSlug, subsectionSlug } = useSlugs()

  return (
    <Disclosure
      classNameButton="py-4 text-left text-sm text-gray-900 hover:bg-gray-50"
      classNamePanel="pb-3"
      button={
        <div className="flex">
          <div className="w-52 flex-none pb-2 pl-4 pr-3 pt-3 sm:w-64 sm:pl-6">
            <StakeholderSectionListItemStatus status={stakeholderNote.status} />
          </div>
          <div className="flex grow items-center px-3 pb-2 pt-3 font-bold text-blue-500">
            {stakeholderNote.title}
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
