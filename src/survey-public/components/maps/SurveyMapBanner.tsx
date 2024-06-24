import clsx from "clsx"

type Props = {
  status: "default" | "pinOutOfView"
  className?: string
  action?: () => void
}

export const SurveyMapBanner: React.FC<Props> = ({ status, className, action }) => {
  switch (status) {
    case "default":
      return (
        <div
          className={clsx(
            "font-sans font-semibold text-base inset-x-0 mx-4 bg-white/80 p-4 px-8 text-center",
            className,
          )}
        >
          Bewegen Sie den Pin auf die gewünschte Position.
        </div>
      )
      break
    case "pinOutOfView":
      return (
        <div
          className={clsx(
            "font-sans text-base font-semibold inset-x-0 mx-4 bg-white/80 p-4 px-8 text-center",
            className,
          )}
        >
          Pin liegt außerhalb der aktuellen Ansicht.{" "}
          <button
            className="text-[var(--survey-primary-color)] hover:underline"
            onClick={action}
            type="button"
          >
            Zentrieren
          </button>
        </div>
      )
  }
}
