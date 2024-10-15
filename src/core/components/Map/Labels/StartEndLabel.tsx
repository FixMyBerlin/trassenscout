import { RouteIcon } from "../Icons"

type Props = {
  icon: React.ReactNode
  subIcon?: string
} & (
  | { start: string; end: string; layout?: "details" }
  | { start?: unknown; end?: unknown; layout?: "compact" }
)

export const StartEndLabel = ({ icon, subIcon, start, end, layout }: Props) => (
  <div className="px-1.5 py-1">
    <div className="flex items-center gap-1.5">
      <div className="flex flex-col items-center leading-4">
        <div className="flex items-center">{icon}</div>
        {subIcon && <div className="font-semibold uppercase">{subIcon}</div>}
      </div>
      {layout === "details" && (
        <>
          <div className="pl-0.5">
            <RouteIcon />
          </div>
          <div className="leading-4">
            <div>{start}</div>
            <div>{end}</div>
          </div>
        </>
      )}
    </div>
  </div>
)
