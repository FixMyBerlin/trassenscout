import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import {
  fieldDataTypes,
  requiredFields,
  subsubsectionFieldTranslations,
} from "@/src/components/abschnitte/utils/subsubsectionFieldMappings"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { quote } from "@/src/components/core/components/text/quote"
import { GeometryTypeEnum, LabelPositionEnum, LocationEnum } from "@/src/prisma/generated/browser"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { projectUsersQueryOptions } from "@/src/server/memberships/projectUsersQueryOptions"
import { SubsubsectionBaseSchema } from "@/src/shared/subsubsections/schemas"

type Props = {
  projectSlug: string
  className?: string
}

const getAllSchemaFields = () => {
  const schemaShape = SubsubsectionBaseSchema.shape
  return Object.keys(schemaShape) as (keyof z.infer<typeof SubsubsectionBaseSchema>)[]
}

type LookupRow = { id: number; slug: string; title: string }

export const SubsubsectionSchemaAdminBox = ({ projectSlug, className }: Props) => {
  const { data: users = [] } = useQuery(projectUsersQueryOptions({ projectSlug, role: "EDITOR" }))
  const { data: qualityData } = useQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "qualityLevels" }),
  )
  const qualityLevels = (qualityData?.rows ?? []) as unknown as LookupRow[]
  const { data: statusData } = useQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "subsubsectionStatuses" }),
  )
  const subsubsectionStatuss = (statusData?.rows ?? []) as unknown as LookupRow[]
  const { data: taskData } = useQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "subsubsectionTasks" }),
  )
  const subsubsectionTasks = (taskData?.rows ?? []) as unknown as LookupRow[]
  const { data: infraData } = useQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "subsubsectionInfras" }),
  )
  const subsubsectionInfras = (infraData?.rows ?? []) as unknown as LookupRow[]
  const { data: specialData } = useQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "subsubsectionSpecials" }),
  )
  const subsubsectionSpecials = (specialData?.rows ?? []) as Array<{ id: number; title: string }>

  const allSchemaFields = getAllSchemaFields()

  const missingTranslations = allSchemaFields.filter(
    (field) => !(field in subsubsectionFieldTranslations),
  )

  return (
    <SuperAdminBox className={className}>
      <details>
        <summary className="cursor-pointer underline-offset-2 hover:underline">
          Schema Information
        </summary>
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="mb-2 font-semibold text-purple-600">Enum Values:</h4>
            <div className="grid gap-2 text-xs">
              <div>
                <strong>type (GeometryTypeEnum) - Enum:</strong>{" "}
                {Object.values(GeometryTypeEnum).join(", ")}
              </div>
              <div>
                <strong>location (LocationEnum) - Enum:</strong>{" "}
                {Object.values(LocationEnum).join(", ")} + null
              </div>
              <div>
                <strong>labelPos (LabelPositionEnum) - Enum:</strong>{" "}
                {Object.values(LabelPositionEnum).join(", ")}
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-semibold text-purple-600">
              Relation Options (ID, SLUG/Title):
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <strong>managerId (Project Users) - Relation:</strong>
                <div className="ml-2">
                  {users.map((user) => (
                    <div key={user.id}>
                      ID: {user.id} - {user.firstName} {user.lastName} ({user.email})
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <strong>qualityLevelId (Quality Levels) - Relation:</strong>
                <div className="ml-2">
                  {qualityLevels.map((ql) => (
                    <div key={ql.id}>
                      ID: {ql.id} - SLUG: {quote(ql.slug)} - Title: {quote(ql.title)}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <strong>subsubsectionStatusId (Phase) - Relation:</strong>
                <div className="ml-2">
                  {subsubsectionStatuss.map((status) => (
                    <div key={status.id}>
                      ID: {status.id} - SLUG: {quote(status.slug)} - Title: {quote(status.title)}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <strong>subsubsectionTaskId (Tasks) - Relation:</strong>
                <div className="ml-2">
                  {subsubsectionTasks.map((task) => (
                    <div key={task.id}>
                      ID: {task.id} - SLUG: {quote(task.slug)} - Title: {quote(task.title)}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <strong>subsubsectionInfraId (Infrastructure) - Relation:</strong>
                <div className="ml-2">
                  {subsubsectionInfras.map((infra) => (
                    <div key={infra.id}>
                      ID: {infra.id} - SLUG: {quote(infra.slug)} - Title: {quote(infra.title)}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <strong>specialFeatures (Special Features - M2M) - Relation:</strong>
                <div className="ml-2">
                  {subsubsectionSpecials.map((special) => (
                    <div key={special.id}>
                      ID: {special.id} - Title: {quote(special.title)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2 font-semibold text-purple-600">Schema Fields:</h4>
            <div className="grid grid-cols-1 gap-1 text-xs">
              {Object.entries(subsubsectionFieldTranslations).map(([fieldName, translation]) => {
                const isRequired = requiredFields.includes(fieldName as any)
                const dataType =
                  fieldDataTypes[fieldName as keyof typeof fieldDataTypes] || "Unknown"
                return (
                  <div key={fieldName} className={isRequired ? "font-bold" : ""}>
                    {translation} ({fieldName}){isRequired ? "" : " (optional)"} : {dataType}
                  </div>
                )
              })}

              {missingTranslations.map((fieldName) => {
                const isRequired = requiredFields.includes(fieldName as any)
                const dataType =
                  fieldDataTypes[fieldName as keyof typeof fieldDataTypes] || "Unknown"
                return (
                  <div key={fieldName} className={`${isRequired ? "font-bold" : ""} text-red-600`}>
                    [MISSING TRANSLATION] {fieldName}
                    {isRequired ? "" : " (optional)"} : {dataType}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </details>
    </SuperAdminBox>
  )
}
