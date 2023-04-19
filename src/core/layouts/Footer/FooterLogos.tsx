import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import React, { Suspense } from "react"
import { getImageSrc } from "src/core/utils/getImageSrc"
import getProject from "src/projects/queries/getProject"

type Props = { className?: string }

export const FooterLogosWithQuery: React.FC<Props> = ({ className }) => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })

  if (!project.partnerLogoSrc) return null

  return (
    <div className="flex">
      <ul
        className={clsx(
          "mx-auto grid w-full grid-flow-row grid-cols-3 items-center justify-evenly gap-8 pb-8 sm:grid-cols-4 md:grid-cols-5",
          className
        )}
      >
        {project.partnerLogoSrc.map((partnerLogo) => (
          <li key={partnerLogo}>
            <img className="mx-auto h-auto w-16" src={getImageSrc(partnerLogo)} alt="partnerLogo" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export const FooterLogos: React.FC<Props> = (props) => {
  return (
    <Suspense>
      <FooterLogosWithQuery {...props} />
    </Suspense>
  )
}
