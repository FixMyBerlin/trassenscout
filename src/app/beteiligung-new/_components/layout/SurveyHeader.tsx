import { SurveyLink } from "@/src/app/beteiligung-new/_components/links/SurveyLink"
import { XMarkIcon } from "@heroicons/react/20/solid"
import Image from "next/image"

type Props = {
  logoSrc: string
  landingPageUrl: string
}

export const SurveyHeader = ({ logoSrc, landingPageUrl }: Props) => {
  return (
    <nav className="z-20 shadow-xl">
      <div className="mx-auto flex items-center justify-between px-2 text-gray-500 sm:px-6 lg:pl-5 lg:pr-2.5">
        <div className="flex h-full items-center justify-start">
          <span className="relative h-[50px] w-[50px]">
            <Image
              className="object-contain"
              fill
              sizes="(max-width: 50px)"
              src={logoSrc}
              alt="Projektlogo"
              priority
            />
          </span>
          <span className="py-5 pl-5">Beteiligung</span>
        </div>
        <SurveyLink classNameOverwrites="text-gray-900" href={landingPageUrl}>
          <XMarkIcon className="h-7 w-7" />
        </SurveyLink>
      </div>
      {/* todo context */}
      {/* <ProgressBar /> */}
    </nav>
  )
}
