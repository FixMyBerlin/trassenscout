import { XMarkIcon } from "@heroicons/react/20/solid"
import Image from "next/image"
import { ProgressBar } from "src/survey-public/components/core/layout/ProgressBar"
import { SurveyLink } from "../links/SurveyLink"

type Props = {
  logoSrc: string
  landingPageUrl: string
  primaryColor: "red" | "pink"
}

export const SurveyHeader: React.FC<Props> = ({ logoSrc, landingPageUrl, primaryColor }) => {
  return (
    <nav className="z-20 shadow-xl">
      <div className="mx-auto flex items-center justify-between px-2 text-gray-500 sm:px-6 lg:pl-5 lg:pr-2.5">
        <div className="flex h-full items-center justify-start">
          <span className="relative w-[51px] h-[21px]">
            <Image className="object-contain" fill src={logoSrc} alt="Projektlogo" />
          </span>
          <span className="py-5 pl-5">Beteiligung</span>
        </div>
        <SurveyLink classNameOverwrites="text-gray-900" href={landingPageUrl}>
          <XMarkIcon className="h-7  w-7" />
        </SurveyLink>
      </div>
      <ProgressBar color={primaryColor} />
    </nav>
  )
}
