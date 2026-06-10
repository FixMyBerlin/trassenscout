import { useQuery } from "@tanstack/react-query"
import { authClient } from "@/src/components/shared/auth/auth-client"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"

export function useCurrentUser() {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const { data: user } = useQuery({
    ...currentUserQueryOptions(),
    enabled: Boolean(session),
  })

  if (sessionPending || !session) return null
  return user ?? null
}
