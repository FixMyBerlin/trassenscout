import clsx from "clsx"
import React from "react"
import { ProjectLogo } from "../Navigation/NavigationProject/ProjectLogo"

type Props = { className?: string }

export const FooterLogos: React.FC<Props> = ({ className }) => {
  return (
    <ul className={clsx("grid grid-cols-3 gap-5", className)}>
      <ProjectLogo />
    </ul>
  )
}
