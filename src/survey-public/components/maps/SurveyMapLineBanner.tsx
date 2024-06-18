import clsx from "clsx"

type Props = {
  from: string | undefined
  to: string | undefined
  className?: string
}

// todo survey clean up or refactor after survey BB - whole component

export const SurveyMapLineBanner: React.FC<Props> = ({ className, from, to }) => {
  if (from && to)
    return (
      <div className={clsx("inset-x-0 mx-4 bg-white/80 p-4 px-8 text-center", className)}>
        Linie von {from} nach {to} ausgewählt
      </div>
    )

  return (
    <div className={clsx("inset-x-0 mx-4 bg-white/80 p-4 px-8 text-center", className)}>
      Wählen Sie die Linie aus dem Netzentwurf aus, zu der Sie Feedback geben möchten.{" "}
    </div>
  )
}
