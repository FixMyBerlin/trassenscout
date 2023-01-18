import { Routes, useParam } from "@blitzjs/next"
import { Section } from "@prisma/client"
import clsx from "clsx"
import React from "react"
import { buttonStyles, Link } from "src/core/components/links"
import { SectionMarker } from "../SectionMarker"

type Props = {
  section: Section
}

export const SectionsTeaser: React.FC<Props> = ({ section }) => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <div
      key={section.id}
      className="group w-full rounded-md border-2 border-gray-200 bg-white p-5 hover:bg-gray-100 md:w-1/3"
    >
      <Link
        href={Routes.SectionDashboardPage({
          projectSlug: projectSlug!,
          sectionSlug: section.slug,
        })}
        classNameOverwrites="flex h-full flex-col justify-between"
      >
        <div className="mb-3 flex items-center justify-start gap-3">
          <SectionMarker number={section.index} />
          <h3 className="grow text-xl font-bold leading-tight">{section.title}</h3>
        </div>
        <div className="flex items-end justify-between">
          <span className="inline-flex items-center rounded-full bg-rsv-ochre px-2.5 py-1 text-xs text-white">
            x/x Stakeholder
          </span>
          <div className={clsx("group-hover:bg-rsv-pink group-hover:text-white", buttonStyles)}>
            Details
          </div>
        </div>
      </Link>
    </div>
  )
}
