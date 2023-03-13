import { H1 } from "../text/Headings"

type Props = {
  title: string
  description?: string
}

export const PageHeaderParticipation: React.FC<Props> = ({
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
