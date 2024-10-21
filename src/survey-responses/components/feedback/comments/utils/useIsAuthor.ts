import { useSession } from "@blitzjs/auth"

export const useIsAuthorOrAdmin = (autorId: number) => {
  const session = useSession()
  return autorId === session.userId || session.role === "ADMIN"
}
