import DashedLine from "../DashedLine"
import { H1, H2 } from "../text/Headings"

type Props = {
  title: string
  subtitle?: string | null
  description?: string
  action?: React.ReactNode
}

export const PageHeader: React.FC<Props> = ({ title, subtitle, description, action }) => {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between">
        <H1>{title}</H1>
        {Boolean(action) && <div className="mb-5 pt-12">{action}</div>}
      </div>

      {Boolean(subtitle) && (
        <H2 className="mb-5 -mt-2 !pt-0 text-2xl font-bold text-gray-900">{subtitle}</H2>
      )}
      {Boolean(description) && <p className="max-w-prose text-base text-gray-500">{description}</p>}

      <DashedLine />
    </section>
  )
}
