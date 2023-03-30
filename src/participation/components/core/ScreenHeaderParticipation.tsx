import { ParticipationH1 } from "./Text"

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

      {Boolean(description) && <p className="text-base text-gray-700 whitespace-pre-wrap">{description}</p>}
    </section>
  )
}
