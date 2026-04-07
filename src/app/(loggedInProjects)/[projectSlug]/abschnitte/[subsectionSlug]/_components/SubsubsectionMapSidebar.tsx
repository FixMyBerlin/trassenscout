"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { Link, whiteButtonStyles } from "@/src/core/components/links"
import { SubsubsectionIcon } from "@/src/core/components/Map/Icons"
import { subsubsectionEditRoute } from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import { TGetSubsubsection } from "@/src/server/subsubsections/queries/getSubsubsection"
import { clsx } from "clsx"
import { SubsubsectionDetailsContent } from "./SubsubsectionDetailsContent"

type Props = {
  subsubsection: TGetSubsubsection
  onClose: () => void
}

export const SubsubsectionMapSidebar = ({ subsubsection, onClose }: Props) => {
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const projectSlug = useProjectSlug()

  return (
    <SubsubsectionDetailsContent
      subsubsection={subsubsection}
      className="h-full w-[950px] overflow-x-hidden"
      header={
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center justify-start gap-2">
            <SubsubsectionIcon slug={subsubsection.slug} />
          </div>
          <div className="flex items-center gap-3">
            <IfUserCanEdit>
              <Link
                icon="edit"
                href={subsubsectionEditRoute(projectSlug, subsectionSlug!, subsubsectionSlug!)}
              >
                bearbeiten
              </Link>
            </IfUserCanEdit>
            <button
              className={clsx("size-8! rounded-full! p-0!", whiteButtonStyles)}
              onClick={onClose}
            >
              &times;
            </button>
          </div>
        </div>
      }
    />
  )
}
