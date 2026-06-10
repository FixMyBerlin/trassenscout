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
  createUpload,
  deleteUpload,
  getSurveyResponseUploadsSplit,
  getUpload,
  getUploads,
  getUploadsWithSubsections,
  updateUpload,
} from "./uploads.server"
export const getUploadsFn = createServerFn({ method: "GET" })
  .inputValidator(GetUploadsSchema)
  .handler(({ data }) => getUploads(getRequestHeaders(), data))

export const getUploadsWithSubsectionsFn = createServerFn({ method: "GET" })
  .inputValidator(GetUploadsWithSubsectionsSchema)
  .handler(({ data }) => getUploadsWithSubsections(getRequestHeaders(), data))

export const getSurveyResponseUploadsSplitFn = createServerFn({ method: "GET" })
  .inputValidator(GetSurveyResponseUploadsSplitSchema)
  .handler(({ data }) => getSurveyResponseUploadsSplit(getRequestHeaders(), data))

export const getUploadFn = createServerFn({ method: "GET" })
  .inputValidator(GetUploadSchema)
  .handler(({ data }) => getUpload(getRequestHeaders(), data))

export const createUploadFn = createServerFn({ method: "POST" })
  .inputValidator(CreateUploadSchema)
  .handler(({ data }) => createUpload(getRequestHeaders(), data))

export const updateUploadFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateUploadSchema)
  .handler(({ data }) => updateUpload(getRequestHeaders(), data))

export const deleteUploadFn = createServerFn({ method: "POST" })
  .inputValidator(DeleteUploadSchema)
  .handler(({ data }) => deleteUpload(getRequestHeaders(), data))

export const getGeolocatedUploadsFn = createServerFn({ method: "GET" })
  .inputValidator(GetGeolocatedUploadsSchema)
  .handler(({ data }) => getGeolocatedUploads(getRequestHeaders(), data))

export const copyToLuckyCloudFn = createServerFn({ method: "POST" })
  .inputValidator(CopyToLuckyCloudSchema)
  .handler(({ data }) => copyToLuckyCloud(getRequestHeaders(), data))

export const endCollaborationFn = createServerFn({ method: "POST" })
  .inputValidator(EndCollaborationSchema)
  .handler(({ data }) => endCollaboration(getRequestHeaders(), data))

export const createSurveyUploadPublicFn = createServerFn({ method: "POST" })
  .inputValidator(CreateSurveyUploadPublicSchema)
  .handler(({ data }) => createSurveyUploadPublic(data))

export const getUploadsMetaPublicFn = createServerFn({ method: "GET" })
  .inputValidator(GetUploadsMetaPublicSchema)
  .handler(({ data }) => getUploadsMetaPublic(data))

export const deleteSurveyUploadPublicFn = createServerFn({ method: "POST" })
  .inputValidator(DeleteSurveyUploadPublicSchema)
  .handler(({ data }) => deleteSurveyUploadPublic(data))
