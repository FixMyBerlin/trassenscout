import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { BuildingLibraryIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"
import Image from "next/image"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import getProject from "src/projects/queries/getProject"
import svgLogoTrassenscout from "../assets/trassenscout-logo-without-text.svg"

type Props = {
  height?: number
  width?: number
  defaultImg?: boolean
}

export const NavigationProjectLogoWithQuery: React.FC<Props> = ({
  width,
  height,
  defaultImg = true,
}) => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })

  const regionlogoWhiteBackgroundRequired = false
  // TODO

  if (!project.logo && !defaultImg) return null

  return (
    <>
      {project.logo ? (
        <div
          className={clsx({
            "rounded-sm bg-white/90 px-1 py-1": regionlogoWhiteBackgroundRequired,
          })}
        >
          <Image src={project.logo} width={width ?? 48} height={height ?? 48} alt="" />
        </div>
      ) : (
        <>
          <Image
            src={svgLogoTrassenscout}
            className="block h-8 w-auto text-yellow-500 lg:hidden"
            alt="Trassenscout"
            height={height ?? 36}
            width={width ?? 48}
          />
        </>
      )}
    </>
  )
}

export const NavigationProjectLogo: React.FC<Props> = (props) => {
  return (
    <Suspense fallback={<Spinner />}>
      <NavigationProjectLogoWithQuery {...props} />
    </Suspense>
  )
}
