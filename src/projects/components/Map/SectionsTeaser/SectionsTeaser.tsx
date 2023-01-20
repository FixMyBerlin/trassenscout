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
    <div className="group rounded-md border border-gray-200 bg-white p-5 shadow-md hover:bg-gray-100">
      <Link
        href={Routes.SectionDashboardPage({
          projectSlug: projectSlug!,
          sectionSlug: section.slug,
        })}
        classNameOverwrites="flex w-full h-full"
      >
        <div className="flex items-center justify-start gap-4">
          <SectionMarker number={section.index} />
          <h3 className="grow text-xl font-bold leading-tight">{section.title}</h3>
        </div>
      </Link>
    </div>
  )
}
