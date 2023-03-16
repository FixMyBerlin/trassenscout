import { H1 } from "../../../core/components/text/Headings"

export type ScreenHeaderParticipationProps = {
  title: string
  description?: string
}

export const ScreenHeaderParticipation: React.FC<ScreenHeaderParticipationProps> = ({
  title,

  description,
}) => {
  return (
    <section className="mb-12">
      <div className="mb-12">
        <H1>{title}</H1>
      </div>

      {Boolean(description) && <p className="text-base text-gray-700">{description}</p>}
    </section>
  )
}
