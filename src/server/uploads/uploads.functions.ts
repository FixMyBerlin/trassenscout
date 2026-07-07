import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { getGeolocatedUploads } from "./geolocatedUploads.server"
import { copyToLuckyCloud, endCollaboration } from "./luckycloud.server"
import {
  createSurveyUploadPublic,
  deleteSurveyUploadPublic,
  getUploadsMetaPublic,
} from "./surveyUploads.server"
import {
  CheckUploadFilenameCollisionsSchema,
  CopyToLuckyCloudSchema,
  CreateSurveyUploadPublicSchema,
  CreateUploadSchema,
  DeleteSurveyUploadPublicSchema,
  DeleteUploadSchema,
  EndCollaborationSchema,
  GetGeolocatedUploadsSchema,
  GetSurveyResponseUploadsSplitSchema,
  GetUploadSchema,
  GetUploadsMetaPublicSchema,
  GetUploadsSchema,
  GetUploadsWithSubsectionsSchema,
  UpdateUploadSchema,
} from "./uploads.inputSchemas"
import {
  checkUploadFilenameCollisions,
  createUpload,
  deleteUpload,
  getSurveyResponseUploadsSplit,
  getUpload,
  getUploads,
  getUploadsWithSubsections,
  updateUpload,
} from "./uploads.server"
export const getUploadsFn = createServerFn({ method: "GET" })
  .validator(GetUploadsSchema)
  .handler(({ data }) => getUploads(getRequestHeaders(), data))

export const getUploadsWithSubsectionsFn = createServerFn({ method: "GET" })
  .validator(GetUploadsWithSubsectionsSchema)
  .handler(({ data }) => getUploadsWithSubsections(getRequestHeaders(), data))

export const getSurveyResponseUploadsSplitFn = createServerFn({ method: "GET" })
  .validator(GetSurveyResponseUploadsSplitSchema)
  .handler(({ data }) => getSurveyResponseUploadsSplit(getRequestHeaders(), data))

export const getUploadFn = createServerFn({ method: "GET" })
  .validator(GetUploadSchema)
  .handler(({ data }) => getUpload(getRequestHeaders(), data))

export const createUploadFn = createServerFn({ method: "POST" })
  .validator(CreateUploadSchema)
  .handler(({ data }) => createUpload(getRequestHeaders(), data))

export const updateUploadFn = createServerFn({ method: "POST" })
  .validator(UpdateUploadSchema)
  .handler(({ data }) => updateUpload(getRequestHeaders(), data))

export const deleteUploadFn = createServerFn({ method: "POST" })
  .validator(DeleteUploadSchema)
  .handler(({ data }) => deleteUpload(getRequestHeaders(), data))

export const checkUploadFilenameCollisionsFn = createServerFn({ method: "GET" })
  .validator(CheckUploadFilenameCollisionsSchema)
  .handler(({ data }) => checkUploadFilenameCollisions(getRequestHeaders(), data))

export const getGeolocatedUploadsFn = createServerFn({ method: "GET" })
  .validator(GetGeolocatedUploadsSchema)
  .handler(({ data }) => getGeolocatedUploads(getRequestHeaders(), data))

export const copyToLuckyCloudFn = createServerFn({ method: "POST" })
  .validator(CopyToLuckyCloudSchema)
  .handler(({ data }) => copyToLuckyCloud(getRequestHeaders(), data))

export const endCollaborationFn = createServerFn({ method: "POST" })
  .validator(EndCollaborationSchema)
  .handler(({ data }) => endCollaboration(getRequestHeaders(), data))

export const createSurveyUploadPublicFn = createServerFn({ method: "POST" })
  .validator(CreateSurveyUploadPublicSchema)
  .handler(({ data }) => createSurveyUploadPublic(data))

export const getUploadsMetaPublicFn = createServerFn({ method: "GET" })
  .validator(GetUploadsMetaPublicSchema)
  .handler(({ data }) => getUploadsMetaPublic(data))

export const deleteSurveyUploadPublicFn = createServerFn({ method: "POST" })
  .validator(DeleteSurveyUploadPublicSchema)
  .handler(({ data }) => deleteSurveyUploadPublic(data))
