import { XMarkIcon } from "@heroicons/react/20/solid"
import { SurveyLink } from "@/src/components/beteiligung/links/SurveyLink"
import { Img } from "@/src/components/shared/Img"
type Props = {
  logoSrc: string
  landingPageUrl: string
  title: string
}

export const SurveyHeader = ({ logoSrc, landingPageUrl, title }: Props) => {
  return (
    <nav className="z-20 shadow-xl">
      <div className="mx-auto flex items-center justify-between px-2 text-gray-500 sm:px-6 lg:pr-2.5 lg:pl-5">
        <div className="flex h-full items-center justify-start">
          <span className="relative flex h-[50px] w-[50px] items-center justify-center">
            <Img
              className="max-h-full max-w-full object-contain"
              src={logoSrc}
              alt="Projektlogo"
              loading="eager"
            />
          </span>
          <span className="py-5 pl-5">{title}</span>
        </div>
        <SurveyLink
          aria-label="Beteiligung schließen"
          classNameOverwrites="text-gray-900 inline-flex min-h-11 min-w-11 items-center justify-center"
          href={landingPageUrl}
        >
          <XMarkIcon className="size-7" aria-hidden="true" />
        </SurveyLink>
      </div>
    </nav>
  )
}
