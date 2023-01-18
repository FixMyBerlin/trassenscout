import { Stakeholdernote } from "@prisma/client"
import React from "react"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { StakeholderStatus } from "./StakeholderStatus"

type props = {
  stakeholder: Stakeholdernote
}

export const StakeholderItem: React.FC<props> = ({ stakeholder }) => {
  return (
    <div className="flex space-x-5">
      <StakeholderStatus status={stakeholder.status} />
      <div className="">
        <p>
          <strong>{stakeholder.title}</strong>
        </p>
        <Markdown className="prose-sm" markdown={stakeholder.statusText} />
      </div>
    </div>
  )
}
