import { TagIcon } from "@heroicons/react/24/outline"
import React from "react"
import { LabeledRadiobuttonGroup } from "./LabeledRadiobuttonGroup"

export const LabeledRadiobuttonGroupLabelPos: React.FC = () => {
  return (
    <LabeledRadiobuttonGroup
      label="Kartenlabel Position"
      scope="labelPos"
      classNameItemWrapper="sm:columns-2"
      items={[
        {
          value: "top",
          name: "top",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-[225deg]" /> Pfeil unten
            </span>
          ),
        },
        {
          value: "topRight",
          name: "topRight",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-[265deg]" /> Pfeil unten links
            </span>
          ),
        },
        {
          value: "right",
          name: "right",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-[315deg]" /> Pfeil links
            </span>
          ),
        },
        {
          value: "bottomRight",
          name: "bottomRight",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-[365deg]" /> Pfeil oben links
            </span>
          ),
        },
        {
          value: "bottom",
          name: "bottom",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-[45deg]" /> Pfeil oben
            </span>
          ),
        },
        {
          value: "bottomLeft",
          name: "bottomLeft",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-[95deg]" /> Pfeil oben rechts
            </span>
          ),
        },
        {
          value: "left",
          name: "left",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-[135deg]" /> Pfeil rechts
            </span>
          ),
        },
        {
          value: "topLeft",
          name: "topLeft",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-[175deg]" /> Pfeil unten rechts
            </span>
          ),
        },
      ]}
    />
  )
}
