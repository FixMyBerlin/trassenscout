import { useParam, Routes } from "@blitzjs/next"
import { Section } from "@prisma/client"
import { along, length, lineString } from "@turf/turf"
import { useRouter } from "next/router"
import { Marker } from "react-map-gl"
import { BaseMap, BaseMapSections } from "../BaseMap"
import { SectionMarker } from "../SectionMarker"

type Props = {
  sections: BaseMapSections
  selectedSection?: BaseMapSections[number]
  isInteractive: boolean
}

export const SectionsMap: React.FC<Props> = ({ sections, selectedSection, isInteractive }) => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")

  const markers = sections.map((section, index) => {
    const midIndex = Math.floor(section.subsections.length / 2)
    const geometryString = section.subsections?.at(midIndex)?.geometry
    if (!section.subsections.length || !midIndex || !geometryString) {
      return null
    }
    const midLine = lineString(JSON.parse(geometryString))
    const midLengthHalf = length(midLine) / 2
    const midPoint = along(midLine, midLengthHalf)

    return (
      <Marker
        key={section.id}
        longitude={midPoint.geometry.coordinates[0]}
        latitude={midPoint.geometry.coordinates[1]}
        anchor="center"
        onClick={() =>
          isInteractive &&
          router.push(
            Routes.SectionDashboardPage({ projectSlug: projectSlug!, sectionSlug: section.slug })
          )
        }
      >
        <SectionMarker isInteractive={isInteractive} number={index + 1} />
      </Marker>
    )
  })

  return (
    <div className="h-[500px] w-full drop-shadow-md">
      <BaseMap selectedSection={selectedSection} isInteractive={isInteractive} sections={sections}>
        {markers}
      </BaseMap>
    </div>
  )
}
