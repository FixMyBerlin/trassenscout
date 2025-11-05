import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { quote } from "@/src/core/components/text/quote"
import {
  fieldDataTypes,
  requiredFields,
  subsubsectionFieldTranslations,
} from "@/src/pagesComponents/subsubsections/subsubsectionFieldMappings"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import getQualityLevelsWithCount from "@/src/server/qualityLevels/queries/getQualityLevelsWithCount"
import getSubsubsectionInfrasWithCount from "@/src/server/subsubsectionInfra/queries/getSubsubsectionInfrasWithCount"
import { SubsubsectionBaseSchema } from "@/src/server/subsubsections/schema"
import getSubsubsectionSpecialsWithCount from "@/src/server/subsubsectionSpecial/queries/getSubsubsectionSpecialsWithCount"
import getSubsubsectionStatussWithCount from "@/src/server/subsubsectionStatus/queries/getSubsubsectionStatussWithCount"
import getSubsubsectionTasksWithCount from "@/src/server/subsubsectionTask/queries/getSubsubsectionTasksWithCount"
import { useQuery } from "@blitzjs/rpc"
import { LabelPositionEnum, LocationEnum, SubsubsectionTypeEnum } from "@prisma/client"
import { z } from "zod"

type SubsubsectionSchemaAdminBoxProps = {
  projectSlug: string
  className?: string
}

// Extract all field names from the actual schema to ensure completeness
const getAllSchemaFields = () => {
  const schemaShape = SubsubsectionBaseSchema.shape
  return Object.keys(schemaShape) as (keyof z.infer<typeof SubsubsectionBaseSchema>)[]
}

export const SubsubsectionSchemaAdminBox = ({
  projectSlug,
  className,
}: SubsubsectionSchemaAdminBoxProps) => {
  // Load admin data
  const [users] = useQuery(getProjectUsers, { projectSlug, role: "EDITOR" })
  const [{ qualityLevels }] = useQuery(getQualityLevelsWithCount, { projectSlug })
  const [{ subsubsectionStatuss }] = useQuery(getSubsubsectionStatussWithCount, { projectSlug })
  const [{ subsubsectionTasks }] = useQuery(getSubsubsectionTasksWithCount, { projectSlug })
  const [{ subsubsectionInfras }] = useQuery(getSubsubsectionInfrasWithCount, { projectSlug })
  const [{ subsubsectionSpecials }] = useQuery(getSubsubsectionSpecialsWithCount, { projectSlug })

  // Get all fields from the schema to ensure we don't miss any
  const allSchemaFields = getAllSchemaFields()

  // Check for missing translations or data types
  const missingTranslations = allSchemaFields.filter(
    (field) => !(field in subsubsectionFieldTranslations),
  )
  const missingDataTypes = allSchemaFields.filter((field) => !(field in fieldDataTypes))
  return (
    <SuperAdminBox className={className}>
      <h3 className="mb-4 font-bold text-purple-700">Schema Information</h3>

      <div className="space-y-4">
        <div>
          <h4 className="mb-2 font-semibold text-purple-600">Enum Values:</h4>
          <div className="grid gap-2 text-xs">
            <div>
              <strong>type (SubsubsectionTypeEnum) - Enum:</strong>{" "}
              {Object.values(SubsubsectionTypeEnum).join(", ")}
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
          <h4 className="mb-2 font-semibold text-purple-600">Relation Options (ID, SLUG/Title):</h4>
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
              <strong>subsubsectionStatusId (Status) - Relation:</strong>
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
            {/* Show fields from translations first (in order) */}
            {Object.entries(subsubsectionFieldTranslations).map(([fieldName, translation]) => {
              const isRequired = requiredFields.includes(fieldName as any)
              const dataType = fieldDataTypes[fieldName as keyof typeof fieldDataTypes] || "Unknown"
              return (
                <div key={fieldName} className={isRequired ? "font-bold" : ""}>
                  {translation} ({fieldName}){isRequired ? "" : " (optional)"} : {dataType}
                </div>
              )
            })}

            {/* Show any fields from schema that are missing from translations */}
            {missingTranslations.map((fieldName) => {
              const isRequired = requiredFields.includes(fieldName as any)
              const dataType = fieldDataTypes[fieldName as keyof typeof fieldDataTypes] || "Unknown"
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
    </SuperAdminBox>
  )
}
