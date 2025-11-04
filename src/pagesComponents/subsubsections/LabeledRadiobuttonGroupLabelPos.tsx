import { TagIcon } from "@heroicons/react/24/outline"
import { LabeledRadiobuttonGroup } from "../../core/components/forms/LabeledRadiobuttonGroup"

export const LabeledRadiobuttonGroupLabelPos = () => {
  return (
    <LabeledRadiobuttonGroup
      label=""
      scope="labelPos"
      classNameItemWrapper="sm:columns-2 pt-2"
      items={[
        {
          value: "top",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-225" /> Pfeil unten
            </span>
          ),
        },
        {
          value: "topRight",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-265" /> Pfeil unten links
            </span>
          ),
        },
        {
          value: "right",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-315" /> Pfeil links
            </span>
          ),
        },
        {
          value: "bottomRight",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-365" /> Pfeil oben links
            </span>
          ),
        },
        {
          value: "bottom",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-45" /> Pfeil oben
            </span>
          ),
        },
        {
          value: "bottomLeft",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-95" /> Pfeil oben rechts
            </span>
          ),
        },
        {
          value: "left",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-135" /> Pfeil rechts
            </span>
          ),
        },
        {
          value: "topLeft",
          label: (
            <span className="flex items-center gap-1.5">
              <TagIcon className="h-5 w-5 rotate-175" /> Pfeil unten rechts
            </span>
          ),
        },
      ]}
    />
  )
}
