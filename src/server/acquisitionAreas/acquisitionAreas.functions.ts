import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateAcquisitionAreaSchema,
  CreateAcquisitionAreasFromSelectionSchema,
  DeleteAcquisitionAreaSchema,
  DeleteAllAcquisitionAreasForSubsubsectionSchema,
  GetAcquisitionAreaSchema,
  GetAcquisitionAreasBySubsubsectionSchema,
  GetAcquisitionAreasSchema,
  UpdateAcquisitionAreaSchema,
} from "./acquisitionAreas.inputSchemas"
import {
  createAcquisitionArea,
  createAcquisitionAreasFromSelection,
  deleteAcquisitionArea,
  deleteAllAcquisitionAreasForSubsubsection,
  getAcquisitionArea,
  getAcquisitionAreas,
  getAcquisitionAreasBySubsubsection,
  getAcquisitionAreasWithProjectRecordCountBySubsubsection,
  updateAcquisitionArea,
} from "./acquisitionAreas.server"
export const getAcquisitionAreasFn = createServerFn({ method: "GET" })
  .validator(GetAcquisitionAreasSchema)
  .handler(({ data }) => getAcquisitionAreas(getRequestHeaders(), data))

export const getAcquisitionAreaFn = createServerFn({ method: "GET" })
  .validator(GetAcquisitionAreaSchema)
  .handler(({ data }) => getAcquisitionArea(getRequestHeaders(), data))

const _createAcquisitionAreaFn = createServerFn({ method: "POST" })
  .validator(CreateAcquisitionAreaSchema)
  .handler(({ data }) => createAcquisitionArea(getRequestHeaders(), data))

export const createAcquisitionAreasFromSelectionFn = createServerFn({ method: "POST" })
  .validator(CreateAcquisitionAreasFromSelectionSchema)
  .handler(({ data }) => createAcquisitionAreasFromSelection(getRequestHeaders(), data))

export const updateAcquisitionAreaFn = createServerFn({ method: "POST" })
  .validator(UpdateAcquisitionAreaSchema)
  .handler(({ data }) => updateAcquisitionArea(getRequestHeaders(), data))

export const deleteAcquisitionAreaFn = createServerFn({ method: "POST" })
  .validator(DeleteAcquisitionAreaSchema)
  .handler(({ data }) => deleteAcquisitionArea(getRequestHeaders(), data))

export const getAcquisitionAreasBySubsubsectionFn = createServerFn({ method: "GET" })
  .validator(GetAcquisitionAreasBySubsubsectionSchema)
  .handler(({ data }) => getAcquisitionAreasBySubsubsection(getRequestHeaders(), data))

export const getAcquisitionAreasWithProjectRecordCountBySubsubsectionFn = createServerFn({
  method: "GET",
})
  .validator(GetAcquisitionAreasBySubsubsectionSchema)
  .handler(({ data }) =>
    getAcquisitionAreasWithProjectRecordCountBySubsubsection(getRequestHeaders(), data),
  )

export const deleteAllAcquisitionAreasForSubsubsectionFn = createServerFn({ method: "POST" })
  .validator(DeleteAllAcquisitionAreasForSubsubsectionSchema)
  .handler(({ data }) => deleteAllAcquisitionAreasForSubsubsection(getRequestHeaders(), data))
