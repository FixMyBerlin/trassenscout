import TrasssenscoutLogo from "@/src/app/_components/layouts/assets/trassenscout-logo-gelb-text-dark.svg"
import Image from "next/image"

type Props = {
  title?: string
  subtitle?: string
  children: React.ReactNode
}

export const TitleBodyWrapper = ({ title, subtitle, children }: Props) => {
  return (
    <>
      <div id="Logo" className="flex flex-col items-center sm:mx-auto sm:w-full sm:max-w-md">
        <Image src={TrasssenscoutLogo} alt="Trassenscout" height={48} />

        {Boolean(title) && (
          <h2 className="mt-12 text-center text-3xl font-semibold tracking-tight text-gray-900">
            {title}
          </h2>
        )}
        {Boolean(subtitle) && <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>}
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">{children}</div>
      </div>
    </>
  )
}
