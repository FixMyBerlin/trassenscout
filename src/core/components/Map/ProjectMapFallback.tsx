import { SubsectionWithPosition } from "src/subsections/queries/getSubsection"
import { BaseMap } from "./BaseMap"
import { subsectionsBbox } from "./utils"

type Props = { subsections: SubsectionWithPosition[] }

export const ProjectMapFallback: React.FC<Props> = ({ subsections }) => {
  return (
    <section className="mt-3 relative">
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: subsectionsBbox(subsections),
          fitBoundsOptions: { padding: 60 },
        }}
      />
      <div className="inset-x-0 mx-4 bg-white/80 p-4 px-8 text-center absolute bottom-12 font-sans">
        Noch keine Planungsabschnitte angelegt
      </div>
    </section>
  )
}
