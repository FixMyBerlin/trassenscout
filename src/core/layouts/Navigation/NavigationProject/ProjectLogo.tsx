import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { BuildingLibraryIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import Image from "next/image"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { getImageSrc } from "src/core/utils/getImageSrc"
import getProject from "src/projects/queries/getProject"
import svgLogoTrassenscout from "../assets/trassenscout-logo-without-text.svg"

type Props = {
  className?: string
  defaultImg?: boolean
}

export const ProjectLogoWithQuery: React.FC<Props> = ({ className, defaultImg = true }) => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })

  const regionlogoWhiteBackgroundRequired = false
  // TODO

  if (!project.logoSrc && !defaultImg) return null

  return (
    <>
      {project.logoSrc ? (
        <div
          className={clsx({
            "rounded-sm bg-white/90 px-1 py-1": regionlogoWhiteBackgroundRequired,
          })}
        >
          <img
            className={clsx(className, "h-12 w-12")}
            src={getImageSrc(project.logoSrc)}
            alt="Projektlogo"
          />
        </div>
      ) : (
        <div className={className}>
          <Image
            src={svgLogoTrassenscout}
            className="block h-8 w-auto text-yellow-500 lg:hidden"
            alt="Trassenscout"
            height={36}
            width={48}
          />
        </div>
      )}
    </>
  )
}

export const ProjectLogo: React.FC<Props> = (props) => {
  return (
    <Suspense fallback={<Spinner />}>
      <ProjectLogoWithQuery {...props} />
    </Suspense>
  )
}
