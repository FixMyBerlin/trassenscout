import { Project, User } from "@prisma/client"
import { Prettify } from "src/core/types"

export type CurrentUser = Prettify<
  Pick<User, "id" | "firstName" | "lastName" | "email" | "phone" | "role"> & {
    projects: Pick<Project, "slug" | "shortTitle">[]
  }
>
