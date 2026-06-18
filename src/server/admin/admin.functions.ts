import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  DeleteAlkisLandAcquisitionDemosSchema,
  SeedAlkisLandAcquisitionDemosSchema,
} from "./admin.inputSchemas"
import { deleteAlkisLandAcquisitionDemos, seedAlkisLandAcquisitionDemos } from "./admin.server"
export const seedAlkisLandAcquisitionDemosFn = createServerFn({ method: "POST" })
  .validator(SeedAlkisLandAcquisitionDemosSchema)
  .handler(() => seedAlkisLandAcquisitionDemos(getRequestHeaders()))

export const deleteAlkisLandAcquisitionDemosFn = createServerFn({ method: "POST" })
  .validator(DeleteAlkisLandAcquisitionDemosSchema)
  .handler(() => deleteAlkisLandAcquisitionDemos(getRequestHeaders()))
