import clsx from "clsx"
import { ReactNode } from "react"
import { DashedLine } from "src/core/components/DashedLine"
import { H2 } from "src/core/components/text"


type Props = {
  title: string
  description?: string | ReactNode
  className?: string
}

export const SurveyResultDisplayHeader: React.FC<Props> = ({
  title,
  description,
  className,
}) => {
  const styledDescription =
    typeof description === "string" ? (
      <p className="mt-5 text-base text-gray-500">{description}</p>
    ) : (
      description
    )
  return (
    <section className={clsx("mb-12", className)}>
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">

          <H2>{title}</H2>
        </div>

      </div>
      {Boolean(description) && styledDescription}

      <DashedLine />
    </section>
  )
}
