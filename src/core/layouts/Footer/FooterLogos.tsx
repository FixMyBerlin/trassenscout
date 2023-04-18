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
    <ul
      className={clsx(
        "flex flex-col items-center justify-evenly gap-4 py-4 sm:flex-row",
        className
      )}
    >
      {project.partnerLogoSrc.map((partnerLogo) => (
        <img
          className="h-auto w-24"
          src={getImageSrc(partnerLogo)}
          alt="partnerLogo"
          key={partnerLogo}
        />
      ))}
    </ul>
  )
}

export const FooterLogos: React.FC<Props> = (props) => {
  return (
    <Suspense>
      <FooterLogosWithQuery {...props} />
    </Suspense>
  )
}
