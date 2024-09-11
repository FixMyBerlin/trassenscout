import clsx from "clsx"

type Props = {
  lineFromToName: string
  className?: string
}

// todo survey clean up or refactor after survey BB - whole component

export const SurveyMapLineBanner: React.FC<Props> = ({ className, lineFromToName }) => {
  if (lineFromToName)
    return (
      <div
        className={clsx(
          "inset-x-0 mx-4 bg-white/80 p-4 px-8 text-center font-sans text-base font-semibold",
          className,
        )}
      >
        Linie von {lineFromToName.replace("-", "nach")} ist ausgewählt
      </div>
    )

  return (
    <div
      className={clsx(
        "inset-x-0 mx-4 bg-white/80 p-4 px-8 text-center font-sans text-base font-semibold",
        className,
      )}
    >
      Wählen Sie hier eine orange Linie aus.
    </div>
  )
}
