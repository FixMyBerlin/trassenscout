import { DashedLine } from "../DashedLine"
import { H1, H2 } from "../text/Headings"

type Props = {
  title: string
  subtitle?: string | null
  description?: string
  action?: React.ReactNode
}

export const PageHeader: React.FC<Props> = ({ title, subtitle, description, action }) => {
  return (
    <section className="mt-3 mb-12 pt-1">
      <div className="mt-5 flex items-center justify-between">
        <H1>{title}</H1>
        {Boolean(action) && <div>{action}</div>}
      </div>

      {Boolean(subtitle) && <H2 className="mt-3">{subtitle}</H2>}
      {Boolean(description) && (
        <p className="mt-5 max-w-prose text-base text-gray-500">{description}</p>
      )}

      <DashedLine />
    </section>
  )
}
