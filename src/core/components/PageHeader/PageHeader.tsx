import DashedLine from "../DashedLine"
import { H1, H2 } from "../text/Headings"

type Props = {
  title: string
  subtitle?: string | null
  description?: string
  action?: React.ReactNode
  intro?: string
}

export const PageHeader: React.FC<Props> = ({ title, subtitle, description, action, intro }) => {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between">
        <H1>{title}</H1>
        {Boolean(action) && <div className="mb-5 pt-12">{action}</div>}
      </div>

      {Boolean(subtitle) && <H2 className="mb-5 text-2xl font-bold text-gray-900">{subtitle}</H2>}
      {Boolean(intro) && <p className="max-w-[730px] text-gray-500">{intro}</p>}
      {Boolean(description) && <p className="text-base text-gray-500">{description}</p>}

      <DashedLine />
    </section>
  )
}
