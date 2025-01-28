"use client"
import updateProjectExportApi from "@/src/server/projects/mutations/updateProjectExportApi"
import { useMutation } from "@blitzjs/rpc"
import React, { useState } from "react"

type Props = {
  slug: string
  isExportApi: boolean
}

export const AdminEnableProjectExportApi = ({ slug, isExportApi }: Props) => {
  const [isExportApiEnabled, setIsExportApiEnabled] = useState(isExportApi)
  const [createProjectMutation] = useMutation(updateProjectExportApi)

  const handleCheckboxChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked
    setIsExportApiEnabled(isChecked)

    try {
      await createProjectMutation({ isExportApi: isChecked, projectSlug: slug })
    } catch (error: any) {
      console.error("Error updating project / enable export API:", error)
    }
  }

  return (
    <div className="my-3">
      <label className="block cursor-pointer whitespace-nowrap text-sm font-medium text-gray-700 hover:text-gray-900">
        <input
          className="mr-3 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          type="checkbox"
          checked={isExportApiEnabled}
          onChange={handleCheckboxChange}
        />
        Export-API aktiv
      </label>
    </div>
  )
}
