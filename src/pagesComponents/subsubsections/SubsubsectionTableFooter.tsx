import { formattedEuro, formattedLength, frenchQuote } from "@/src/core/components/text"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { clsx } from "clsx"

type Props = {
  subsubsections: SubsubsectionWithPosition[]
  compact: boolean
}

export const SubsubsectionTableFooter: React.FC<Props> = ({ subsubsections, compact }) => {
  const uniqueQualityLevels = subsubsections
    .map((sub) => sub.qualityLevel)
    .filter((level, index, self) => index === self.findIndex((t) => t?.slug === level?.slug))

  return (
    <tfoot className={clsx("bg-gray-50", { hidden: !subsubsections.length || compact })}>
      <tr>
        <td
          colSpan={3}
          className="pb-2 pl-4 pr-3 pt-4 text-right text-xs font-medium uppercase text-gray-500"
        >
          Gesamt:
        </td>
        <td
          className={clsx(
            compact ? "hidden" : "",
            "whitespace-nowrap pb-2 pl-4 pr-3 pt-4 text-sm font-medium text-gray-900",
          )}
        >
          {formattedLength(subsubsections.reduce((acc, sub) => acc + (sub.lengthKm || 0), 0))}
        </td>
        <td
          className={clsx(
            compact ? "hidden" : "",
            "whitespace-nowrap pb-2 pl-4 pr-3 pt-4 text-sm font-medium text-gray-900",
          )}
        >
          -
        </td>
        <td
          className={clsx(
            compact ? "hidden" : "",
            "whitespace-nowrap pb-2 pl-4 pr-3 pt-4 text-sm font-medium text-gray-900",
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
              colSpan={3}
              className="py-2 pl-4 pr-3 text-right text-xs font-medium uppercase text-gray-500"
            >
              Standard {frenchQuote(qualityLevel.title)}:
            </td>
            <td
              className={clsx(
                compact ? "hidden" : "",
                "py-2 pl-4 pr-3 text-sm font-medium text-gray-900",
              )}
            >
              {formattedLength(
                subsubsectionForQualityLevel.reduce((acc, sub) => acc + (sub.lengthKm || 0), 0),
              )}
            </td>
            <td
              className={clsx(
                compact ? "hidden" : "",
                "py-2 pl-4 pr-3 text-sm font-medium text-gray-900",
              )}
            >
              -
            </td>
            <td
              className={clsx(
                compact ? "hidden" : "",
                "py-2 pl-4 pr-3 text-sm font-medium text-gray-900",
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
