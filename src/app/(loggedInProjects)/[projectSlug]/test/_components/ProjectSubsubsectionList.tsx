"use client"

import { SubsubsectionIcon } from "@/src/core/components/Map/Icons"
import { Link } from "@/src/core/components/links"
import { shortTitle } from "@/src/core/components/text"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import { subsubsectionDashboardRoute } from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"

type Props = {
  subsubsections: SubsubsectionWithPosition[]
}

export function ProjectSubsubsectionList({ subsubsections }: Props) {
  const projectSlug = useProjectSlug()

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-4 lg:w-80">
      <h2 className="text-sm font-semibold text-gray-900">Einträge</h2>
      <p className="mt-1 text-xs text-gray-500">
        Klick auf der Karte oder in der Liste öffnet den jeweiligen Eintrag.
      </p>
      <ul className="mt-3 max-h-[min(60vh,520px)] space-y-0.5 overflow-y-auto rounded-md border border-gray-200 bg-white p-2 text-sm shadow-sm">
        {subsubsections.length === 0 ? (
          <li className="px-2 py-3">
            <ZeroCase small visible name="Einträge in diesem Projekt" />
          </li>
        ) : (
          subsubsections.map((ss) => (
            <li key={ss.id}>
              <Link
                href={subsubsectionDashboardRoute(projectSlug, ss.subsection.slug, ss.slug)}
                className="flex items-start gap-2 rounded px-2 py-1.5 hover:bg-gray-50"
              >
                <span className="mt-0.5 shrink-0">
                  <SubsubsectionIcon slug={ss.slug} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-gray-900">
                    {shortTitle(ss.slug)}
                  </span>
                  {ss.SubsubsectionTask?.title && (
                    <span className="block truncate text-xs text-gray-500">
                      {ss.SubsubsectionTask.title}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </aside>
  )
}
