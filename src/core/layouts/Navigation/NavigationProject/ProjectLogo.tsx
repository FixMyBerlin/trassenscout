import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
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

  if (!project.logoSrc && !defaultImg) return null

  return (
    <>
      {project.logoSrc ? (
        <div className={clsx(className, "relative h-12 w-12")}>
          <Image
            className="object-contain"
            layout="fill"
            src={getImageSrc(project.logoSrc)}
            alt="Projektlogo"
          />
        </div>
      ) : (
        <div className={className}>
          <Image
            src={svgLogoTrassenscout}
            className="text-yellow-500"
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