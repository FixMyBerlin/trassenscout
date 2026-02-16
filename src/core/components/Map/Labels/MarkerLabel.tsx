import { RouteIcon } from "../Icons"

type Props = {
  icon: React.ReactNode
  subIcon?: string
  layout?: "details" | "compact"
}

export const MarkerLabel = ({ icon, subIcon, layout }: Props) => {
  const hasDetails = layout === "details"

  return (
    <div className="px-1.5 py-1">
      <div className="flex items-center gap-1.5">
        <div className="flex flex-col items-center leading-4">
          <div className="flex items-center">{icon}</div>
          {/* {subIcon && <div className="font-semibold uppercase">{subIcon}</div>} */}
        </div>
        {hasDetails && (
          <>
            <div className="pl-0.5">
              <RouteIcon />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
