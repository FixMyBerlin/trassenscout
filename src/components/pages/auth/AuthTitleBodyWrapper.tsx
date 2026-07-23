import svgLogoTrassenscout from "@/src/components/shared/app/layouts/assets/trassenscout-logo-gelb-text-dark.svg"
import { Img } from "@/src/components/shared/Img"

type Props = {
  title?: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthTitleBodyWrapper({ title, subtitle, children }: Props) {
  return (
    <>
      <div id="Logo" className="flex flex-col items-center sm:mx-auto sm:w-full sm:max-w-md">
        <Img
          src={svgLogoTrassenscout}
          alt="Trassenscout"
          className="h-12 w-auto"
          height={48}
          width={149}
          loading="eager"
        />

        {Boolean(title) && (
          <h2 className="mt-12 text-center text-3xl font-semibold tracking-tight text-gray-900">
            {title}
          </h2>
        )}
        {Boolean(subtitle) && <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>}
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white shadow-sm sm:rounded-lg">{children}</div>
      </div>
    </>
  )
}
