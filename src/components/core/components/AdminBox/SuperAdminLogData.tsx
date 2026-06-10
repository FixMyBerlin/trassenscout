import { CommandLineIcon } from "@heroicons/react/20/solid"
import { authClient } from "@/src/components/shared/auth/auth-client"
import { UserRoleEnum } from "@/src/prisma/generated/browser"
import { AdminBoxIconButton } from "./AdminBoxIconButton"

type Props = { data: unknown }

const adminDebugTooltip = "Gibt Debug-Daten in der Browser-Konsole aus (nur für Admins)"

export const SuperAdminLogData = ({ data }: Props) => {
  const { data: session } = authClient.useSession()

  if (session?.role !== UserRoleEnum.ADMIN) {
    return null
  }

  return (
    <AdminBoxIconButton label={adminDebugTooltip} onClick={() => console.log(data)}>
      <CommandLineIcon className="size-4" aria-hidden />
    </AdminBoxIconButton>
  )
}
