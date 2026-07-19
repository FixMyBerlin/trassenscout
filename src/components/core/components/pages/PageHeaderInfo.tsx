import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react"
import { InformationCircleIcon } from "@heroicons/react/24/solid"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@/src/components/core/components/links/Link"
import { useTryRouteParam } from "@/src/components/core/routes/useTryRouteParam"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
import { authClient } from "@/src/components/shared/auth/auth-client"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

type Props = {
  children: React.ReactNode
}

function useCurrentProjectRoleText(projectSlug: string | undefined) {
  const { data: session } = authClient.useSession()
  const { data: user } = useQuery(currentUserQueryOptions())
  const isAdmin = session?.role === UserRoleEnum.ADMIN

  if (isAdmin) return "Trassenscout-Admin (Superadmin)"
  if (!projectSlug || !user?.memberships.length) return null

  const membership = user.memberships.find((m) => m.project.slug === projectSlug)
  if (!membership) return null

  return roleTranslation[membership.role]
}

export function PageHeaderInfo({ children }: Props) {
  const projectSlug = useTryRouteParam("projectSlug")
  const roleText = useCurrentProjectRoleText(projectSlug)

  return (
    <Popover className="relative shrink-0">
      <PopoverButton className="flex cursor-pointer items-center rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-hidden">
        <span className="sr-only">Seiteninformationen</span>
        <InformationCircleIcon className="size-5" aria-hidden="true" />
      </PopoverButton>
      <PopoverPanel
        anchor="bottom end"
        className="z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-md bg-white p-4 text-sm text-gray-600 shadow-lg ring-1 ring-gray-200"
      >
        <div className="space-y-3">
          {roleText ? <p className="font-medium text-gray-900">{roleText}</p> : null}
          <div>{children}</div>
          <p>
            <Link to="/support">Support & Dokumentation</Link>
          </p>
        </div>
      </PopoverPanel>
    </Popover>
  )
}
