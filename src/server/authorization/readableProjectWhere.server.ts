import { UserRoleEnum } from "@/src/prisma/generated/browser"

export function readableProjectWhere(
  userId: number,
  role: string,
  projectSlug: string | undefined,
) {
  return {
    ...(projectSlug ? { slug: projectSlug } : {}),
    ...(role === UserRoleEnum.ADMIN ? {} : { memberships: { some: { userId } } }),
  }
}
