import { Routes, useParam } from "@blitzjs/next"
import { Section } from "@prisma/client"
import React from "react"
import { Link } from "src/core/components/links"
import { SectionMarker } from "../Markers"

type Props = {
  section: Section
}

export const SectionsTeaser: React.FC<Props> = ({ section }) => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <Link
      href={Routes.SectionDashboardPage({
        projectSlug: projectSlug!,
        sectionSlug: section.slug,
      })}
      classNameOverwrites="flex items-center justify-start gap-4 rounded-md border border-gray-200 bg-white p-5 shadow-md hover:bg-gray-100 hover:text-blue-500"
    >
      <SectionMarker label={`TS${section.index}`} />
      <h3 className="flex items-center pt-0.5 text-xl font-bold leading-tight">{section.title}</h3>
    </Link>
  )
}
