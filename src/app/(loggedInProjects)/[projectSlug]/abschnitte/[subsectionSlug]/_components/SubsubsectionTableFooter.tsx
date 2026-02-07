import { formattedEuro, formattedLength, frenchQuote } from "@/src/core/components/text"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { clsx } from "clsx"

type Props = {
  subsubsections: SubsubsectionWithPosition[]
  compact: boolean
}

export const SubsubsectionTableFooter = ({ subsubsections, compact }: Props) => {
  const uniqueQualityLevels = subsubsections
    .map((sub) => sub.qualityLevel)
    .filter((level, index, self) => index === self.findIndex((t) => t?.slug === level?.slug))

  return (
    <tfoot className={clsx("bg-gray-50", { hidden: !subsubsections.length || compact })}>
      <tr>
        <td
          colSpan={2}
          className="pt-4 pr-3 pb-2 pl-4 text-right text-xs font-medium text-gray-500 uppercase"
        >
          Gesamt:
        </td>
        <td
          className={clsx(
            compact ? "hidden" : "",
            "pt-4 pr-3 pb-2 pl-4 text-sm font-medium whitespace-nowrap text-gray-900",
          )}
        >
          {formattedLength(subsubsections.reduce((acc, sub) => acc + (sub.lengthM || 0), 0))}
        </td>
        <td
          className={clsx(
            compact ? "hidden" : "",
            "pt-4 pr-3 pb-2 pl-4 text-sm font-medium whitespace-nowrap text-gray-900",
          )}
        >
          {formattedEuro(subsubsections.reduce((acc, sub) => acc + (sub.costEstimate || 0), 0))}
        </td>
        <td></td>
        <td></td>
      </tr>

      {uniqueQualityLevels.map((qualityLevel) => {
        if (!qualityLevel) return null
        const subsubsectionForQualityLevel = subsubsections.filter(
          (sub) => sub.qualityLevel?.slug === qualityLevel.slug,
        )
        return (
          <tr key={qualityLevel.slug}>
            <td
              colSpan={2}
              className="py-2 pr-3 pl-4 text-right text-xs font-medium text-gray-500 uppercase"
            >
              Standard {frenchQuote(qualityLevel.title)}:
            </td>
            <td
              className={clsx(
                compact ? "hidden" : "",
                "py-2 pr-3 pl-4 text-sm font-medium text-gray-900",
              )}
            >
              {formattedLength(
                subsubsectionForQualityLevel.reduce((acc, sub) => acc + (sub.lengthM || 0), 0),
              )}
            </td>
            <td
              className={clsx(
                compact ? "hidden" : "",
                "py-2 pr-3 pl-4 text-sm font-medium text-gray-900",
              )}
            >
              {formattedEuro(
                subsubsectionForQualityLevel.reduce((acc, sub) => acc + (sub.costEstimate || 0), 0),
              )}
            </td>
            <td></td>
            <td></td>
          </tr>
        )
      })}
    </tfoot>
  )
}
