import { ProjectLogo } from "src/core/layouts/Navigation/NavigationProject/ProjectLogo"
import DashedLine from "../DashedLine"
import { H1, H2 } from "../text/Headings"

type Props = {
  title: string
  subtitle?: string | null
  description?: string
  action?: React.ReactNode
  logo?: boolean
  intro?: string
}

export const PageHeader: React.FC<Props> = ({
  title,
  subtitle,
  description,
  action,
  logo = false,
  intro,
}) => {
  return (
    <section className="mb-12">
      {logo ? (
        <div className="flex items-start justify-between">
          <div>
            <H1>{title}</H1>
          </div>
          <div className="hidden shrink-0 px-8 pb-4 sm:block">
            <ProjectLogo className="h-36 w-36" defaultImg={false} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <H1>{title}</H1>
            {Boolean(action) && <div>{action}</div>}
          </div>
        </>
      )}

      {Boolean(subtitle) && <H2 className="mb-5 text-2xl font-bold text-gray-900">{subtitle}</H2>}
      {Boolean(intro) && <p className="max-w-[730px] text-gray-500">{intro}</p>}
      {Boolean(description) && <p className="text-base text-gray-500">{description}</p>}

      <DashedLine />
    </section>
  )
}
