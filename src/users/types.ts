import { Project, User } from "@prisma/client"

export type CurrentUser = Pick<
  User,
  "id" | "firstName" | "lastName" | "email" | "phone" | "role"
> & { projects: Pick<Project, "slug" | "shortTitle">[] }
