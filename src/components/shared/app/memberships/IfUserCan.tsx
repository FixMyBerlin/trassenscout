import { useUserCan } from "./hooks/useUserCan"

type Props = {
  children: React.ReactNode
  /** Set when this renders outside `/_loggedInProjects/$projectSlug`, such as a dashboard modal. */
  projectSlug?: string
}

export const IfUserCanEdit = ({ children, projectSlug }: Props) => {
  return useUserCan(projectSlug).edit ? <>{children}</> : null
}
