import pngRsv8Logo from "./../../layouts/Navigation/assets/rsv8-logo.png" // TODO Logo dynamisch
import Image from "next/image"
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
          <H1 className="mb-5 pt-12 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            {title}
          </H1>
          <div className="shrink-0">
            <Image src={pngRsv8Logo} width={146} height={146} alt="" />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <H1 className="mb-5 pt-12 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            {title}
          </H1>
          {Boolean(action) && <div>{action}</div>}
        </div>
      )}

      {Boolean(subtitle) && <H2 className="mb-5 text-2xl font-bold text-gray-900">{subtitle}</H2>}
      {Boolean(intro) && <p className="max-w-[730px] text-gray-500">{intro}</p>}
      {Boolean(description) && <p className="text-base text-gray-500">{description}</p>}
      <DashedLine />
    </section>
  )
}
