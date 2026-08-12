import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  getSubsubsectionExtraFieldValueCounts,
  getSubsubsectionExtraFieldsProjects,
  GetSubsubsectionExtraFieldValueCountsSchema,
  updateProjectSubsubsectionExtraFieldDefinitions,
  UpdateProjectSubsubsectionExtraFieldDefinitionsSchema,
} from "./subsubsectionExtraFields.server"

export const getSubsubsectionExtraFieldsProjectsFn = createServerFn({ method: "GET" }).handler(() =>
  getSubsubsectionExtraFieldsProjects(getRequestHeaders()),
)

export const getSubsubsectionExtraFieldValueCountsFn = createServerFn({ method: "GET" })
  .validator(GetSubsubsectionExtraFieldValueCountsSchema)
  .handler(({ data }) => getSubsubsectionExtraFieldValueCounts(getRequestHeaders(), data))

export const updateProjectSubsubsectionExtraFieldDefinitionsFn = createServerFn({ method: "POST" })
  .validator(UpdateProjectSubsubsectionExtraFieldDefinitionsSchema)
  .handler(({ data }) => updateProjectSubsubsectionExtraFieldDefinitions(getRequestHeaders(), data))
