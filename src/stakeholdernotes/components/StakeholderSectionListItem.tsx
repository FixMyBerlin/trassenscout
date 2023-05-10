import { Routes, useParam } from "@blitzjs/next"
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid"
import { Stakeholdernote } from "@prisma/client"
import clsx from "clsx"
import React, { useState } from "react"
import { Link, linkStyles } from "src/core/components/links"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { StakeholderSectionListItemStatus } from "./StakeholderSectionListItemStatus"
import { useSlugs } from "src/core/hooks"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"

type Props = {
  stakeholder: Stakeholdernote
}

export const StakeholderSectionListItem: React.FC<Props> = ({ stakeholder }) => {
  const { projectSlug, sectionSlug, subsectionSlug } = useSlugs()
  const [isExpand, setIsExpand] = useState(false)

  const handleToggle = () => {
    setIsExpand(!isExpand)
  }

  const readMore = stakeholder.statusText && stakeholder.statusText.length > 100

  return (
    <article>
      <button
        // This button is a readmore-feature. Its not great. For now, lets just visually hide it if no statusText is present.
        // We should make this nicer…
        className={clsx(
          readMore ? "group/stakeholder" : "cursor-default",
          "flex w-full gap-7 text-left"
        )}
        onClick={handleToggle}
      >
        <StakeholderSectionListItemStatus status={stakeholder.status} />

        <div className="grow">
          <h4
            className={clsx(
              { "text-blue-500 group-hover/stakeholder:text-blue-800": readMore },
              "font-semibold"
            )}
          >
            {stakeholder.title}
          </h4>
          <Markdown
            className={clsx("prose prose-sm", isExpand ? "line-clamp-none" : "line-clamp-2")}
            markdown={stakeholder.statusText}
          />
        </div>
      </button>
      <ButtonWrapper className={clsx(readMore ? "mt-1" : "-mt-5", "justify-end")}>
        {readMore && (
          <button className={linkStyles} onClick={handleToggle}>
            {isExpand ? "Zuklappen" : "Weiterlesen"}
          </button>
        )}
        <Link
          href={Routes.EditStakeholdernotePage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
            subsectionSlug: subsectionSlug!,
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
            subsectionSlug: subsectionSlug!,
            stakeholdernoteId: stakeholder.id,
          })}
        >
          <TrashIcon className="h-4 w-4" />
        </Link>
      </ButtonWrapper>
    </article>
  )
}
