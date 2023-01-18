import { Routes } from "@blitzjs/next"
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid"
import { Stakeholdernote } from "@prisma/client"
import React from "react"
import { Link } from "src/core/components/links"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { StakeholderStatus } from "./StakeholderStatus"

type props = {
  stakeholder: Stakeholdernote
}

export const StakeholderItem: React.FC<props> = ({ stakeholder }) => {
  return (
    <div>
      <div className="flex space-x-5">
        <StakeholderStatus status={stakeholder.status} />
        <div className="">
          <p>
            <strong>{stakeholder.title}</strong>
          </p>
          <Markdown className="prose-sm" markdown={stakeholder.statusText} />
        </div>
      </div>
      <div className="flex items-center justify-end space-x-4">
        <Link
          button
          href={Routes.EditStakeholdernotePage({
            stakeholdernoteId: stakeholder.id,
          })}
        >
          <PencilSquareIcon className="h-5 w-5" />
          <span className="sr-only">Bearbeiten</span>
        </Link>
        <Link
          href={Routes.ShowStakeholdernotePage({
            stakeholdernoteId: stakeholder.id,
          })}
        >
          <TrashIcon className="h-5 w-5" />
        </Link>
      </div>
    </div>
  )
}
