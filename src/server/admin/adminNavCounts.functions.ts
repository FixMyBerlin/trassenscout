import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { getAdminNavCounts } from "./adminNavCounts.server"

export const getAdminNavCountsFn = createServerFn({ method: "GET" }).handler(() =>
  getAdminNavCounts(getRequestHeaders()),
)
