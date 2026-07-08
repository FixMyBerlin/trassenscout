import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { getOptionalCurrentUser } from "./publicCurrentUser.server"

export const getOptionalCurrentUserFn = createServerFn({ method: "GET" }).handler(() =>
  getOptionalCurrentUser(getRequestHeaders()),
)
