import { SubsectionWithPosition } from "@/src/subsections/queries/getSubsection"
import { BaseMap } from "./BaseMap"
import { subsectionsBbox } from "./utils"

type Props = { subsections: SubsectionWithPosition[] }

export const ProjectMapFallback: React.FC<Props> = ({ subsections }) => {
  return (
    <section className="relative mt-3">
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: subsectionsBbox(subsections),
          fitBoundsOptions: { padding: 60 },
        }}
      />
      <div className="absolute inset-x-0 bottom-12 mx-4 bg-white/80 p-4 px-8 text-center font-sans">
        Noch keine Planungsabschnitte angelegt
      </div>
    </section>
  )
}
