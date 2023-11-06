import { ParticipationH1 } from "../core/Text"

export type ScreenHeaderParticipationProps = {
  title: string
  description?: string
}

export const ScreenHeaderParticipation: React.FC<ScreenHeaderParticipationProps> = ({
  title,

  description,
}) => {
  return (
    <section className="mb-2">
      <div className="mb-8">
        <ParticipationH1>{title}</ParticipationH1>
      </div>

      {Boolean(description) && (
        <p className="whitespace-pre-wrap text-base text-gray-700">{description}</p>
      )}
    </section>
  )
}
