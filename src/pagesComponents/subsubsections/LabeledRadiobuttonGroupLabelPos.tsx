import { TagIcon } from "@heroicons/react/24/outline"
import { LabeledRadiobuttonGroup } from "../../core/components/forms/LabeledRadiobuttonGroup"

export const LabeledRadiobuttonGroupLabelPos = () => {
  return (
    <details>
      <summary className="mb-2 cursor-pointer">Anzeige-Optionen für Karten-Label</summary>
      <LabeledRadiobuttonGroup
        label=""
        scope="labelPos"
        classNameItemWrapper="sm:columns-2"
        items={[
          {
            value: "top",
            label: (
              <span className="flex items-center gap-1.5">
                <TagIcon className="h-5 w-5 rotate-[225deg]" /> Pfeil unten
              </span>
            ),
          },
          {
            value: "topRight",
            label: (
              <span className="flex items-center gap-1.5">
                <TagIcon className="h-5 w-5 rotate-[265deg]" /> Pfeil unten links
              </span>
            ),
          },
          {
            value: "right",
            label: (
              <span className="flex items-center gap-1.5">
                <TagIcon className="h-5 w-5 rotate-[315deg]" /> Pfeil links
              </span>
            ),
          },
          {
            value: "bottomRight",
            label: (
              <span className="flex items-center gap-1.5">
                <TagIcon className="h-5 w-5 rotate-[365deg]" /> Pfeil oben links
              </span>
            ),
          },
          {
            value: "bottom",
            label: (
              <span className="flex items-center gap-1.5">
                <TagIcon className="h-5 w-5 rotate-[45deg]" /> Pfeil oben
              </span>
            ),
          },
          {
            value: "bottomLeft",
            label: (
              <span className="flex items-center gap-1.5">
                <TagIcon className="h-5 w-5 rotate-[95deg]" /> Pfeil oben rechts
              </span>
            ),
          },
          {
            value: "left",
            label: (
              <span className="flex items-center gap-1.5">
                <TagIcon className="h-5 w-5 rotate-[135deg]" /> Pfeil rechts
              </span>
            ),
          },
          {
            value: "topLeft",
            label: (
              <span className="flex items-center gap-1.5">
                <TagIcon className="h-5 w-5 rotate-[175deg]" /> Pfeil unten rechts
              </span>
            ),
          },
        ]}
      />
    </details>
  )
}
