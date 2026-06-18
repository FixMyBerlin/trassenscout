import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { GetAlkisWfsParcelsSchema } from "./alkis.inputSchemas"
import { getAlkisAttributionByProject, getAlkisWfsParcels } from "./alkis.server"
export const getAlkisWfsParcelsFn = createServerFn({ method: "GET" })
  .validator(GetAlkisWfsParcelsSchema)
  .handler(({ data }) => getAlkisWfsParcels(getRequestHeaders(), data))

export const getAlkisAttributionByProjectFn = createServerFn({ method: "GET" })
  .validator(ProjectSlugRequiredSchema)
  .handler(({ data }) => getAlkisAttributionByProject(getRequestHeaders(), data))
