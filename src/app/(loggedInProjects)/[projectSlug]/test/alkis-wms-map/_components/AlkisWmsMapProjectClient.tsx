"use client"

import { Spinner } from "@/src/core/components/Spinner"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import { useQuery } from "@blitzjs/rpc"
import { ProjectSubsubsectionList } from "../../_components/ProjectSubsubsectionList"
import { AlkisWmsTestMap } from "./AlkisWmsTestMap"

export function AlkisWmsMapProjectClient() {
  const projectSlug = useProjectSlug()
  const [{ subsubsections }, { isLoading }] = useQuery(getSubsubsections, { projectSlug })

  if (isLoading) {
    return <Spinner page />
  }

  const list = subsubsections ?? []

  return (
    <div className="relative mt-12 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <div className="min-w-0 flex-1">
        <AlkisWmsTestMap subsubsections={list} />
      </div>
      <ProjectSubsubsectionList subsubsections={list} />
    </div>
  )
}
