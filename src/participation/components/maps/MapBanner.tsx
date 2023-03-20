import clsx from "clsx"
import { pinkButtonStyles } from "src/core/components/links"

type Props = {
  status: "default" | "pinOutOfView"
  className?: string
  action?: any
  // TODO
}

export const MapBanner: React.FC<Props> = ({ status, className, action }) => {
  switch (status) {
    case "default":
      return (
        <div className={clsx("inset-x-0 mx-4 bg-white/80 p-4 px-8 text-center", className)}>
          Bewegen Sie den Pin auf Ihre gewünschte Position
        </div>
      )
      break
    case "pinOutOfView":
      return (
        <div className={clsx("inset-x-0 mx-4 bg-white/80 p-4 px-8 text-center", className)}>
          Pin liegt außerhalb der aktuellen Ansicht
          <button className="text-pink-500 hover:underline" onClick={action} type="button">
            Zentrieren
          </button>
        </div>
      )
  }
}
