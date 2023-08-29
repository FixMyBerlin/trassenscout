import clsx from "clsx"
import {
  formattedEuro,
  formattedLength,
  formattedWidth,
  frenchQuote,
} from "src/core/components/text"
import { SubsubsectionWithPosition } from "src/subsubsections/queries/getSubsubsection"

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
          className="uppercase pt-4 pb-2 pl-4 pr-3 text-xs font-medium text-gray-500 text-right"
        >
          Gesamt:
        </td>
        <td
          className={clsx(
            compact ? "hidden" : "",
            "pt-4 pb-2 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap",
          )}
        >
          {formattedLength(subsubsections.reduce((acc, sub) => acc + (sub.length || 0), 0))}
        </td>
        <td
          className={clsx(
            compact ? "hidden" : "",
            "pt-4 pb-2 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap",
          )}
        >
          -
        </td>
        <td
          className={clsx(
            compact ? "hidden" : "",
            "pt-4 pb-2 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap",
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
              className="uppercase py-2 pl-4 pr-3 text-xs font-medium text-gray-500 text-right"
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
                subsubsectionForQualityLevel.reduce((acc, sub) => acc + (sub.length || 0), 0),
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
