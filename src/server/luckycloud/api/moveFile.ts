import { z } from "zod"
import { getDefaultRepoId, luckyCloudApiRequest } from "../_utils/client"
import { truncateErrorText } from "../_utils/errorTruncation"

const BatchMoveResponseSchema = z.object({
  success: z.boolean(),
})

export async function moveFile(sourcePath: string, destPath: string) {
  const repoId = await getDefaultRepoId()

  const sourceDir = sourcePath.substring(0, sourcePath.lastIndexOf("/")) || "/"
  const filename = sourcePath.split("/").pop() || ""

  if (!filename) {
    throw new Error(`Invalid source path: ${sourcePath}`)
  }

  let destDir = destPath.substring(0, destPath.lastIndexOf("/")) || "/"
  if (!destDir.startsWith("/")) {
    destDir = `/${destDir}`
  }

  const response = await luckyCloudApiRequest("BatchMoveItem", {
    method: "POST",
    body: JSON.stringify({
      src_repo_id: repoId,
      src_parent_dir: sourceDir,
      dst_repo_id: repoId,
      dst_parent_dir: destDir,
      src_dirents: [filename],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to move file: ${response.status} ${truncateErrorText(errorText)}`)
  }

  const data = BatchMoveResponseSchema.parse(await response.json())

  if (!data.success) {
    throw new Error("Move operation returned success: false")
  }
}
