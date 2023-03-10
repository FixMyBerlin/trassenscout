import { Routes, useParam } from "@blitzjs/next"
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid"
import { Stakeholdernote } from "@prisma/client"
import clsx from "clsx"
import React, { useState } from "react"
import { Link } from "src/core/components/links"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { StakeholderStatus } from "./StakeholderStatus"

type props = {
  stakeholder: Stakeholdernote
}

export const StakeholderItem: React.FC<props> = ({ stakeholder }) => {
  const sectionSlug = useParam("sectionSlug", "string")
  const projectSlug = useParam("projectSlug", "string")
  const [isExpand, setIsExpand] = useState(false)

  const handleToggle = () => {
    setIsExpand(!isExpand)
  }

  return (
    <div>
      <div className="flex cursor-pointer space-x-5">
        <StakeholderStatus status={stakeholder.status} />
        <div>
          <p>
            <strong>{stakeholder.title}</strong>
          </p>
          <button className="text-left" onClick={handleToggle}>
            <Markdown
              className={clsx("prose-sm", !isExpand ? "line-clamp-2" : "line-clamp-none")}
              markdown={stakeholder.statusText}
            />
          </button>
        </div>
      </div>
      <div className="mb-2 flex items-center justify-end space-x-4">
        <Link
          href={Routes.EditStakeholdernotePage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
            stakeholdernoteId: stakeholder.id,
          })}
        >
          <PencilSquareIcon className="h-4 w-4" />
          <span className="sr-only">Bearbeiten</span>
        </Link>
        <Link
          href={Routes.ShowStakeholdernotePage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
            stakeholdernoteId: stakeholder.id,
          })}
        >
          <TrashIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
