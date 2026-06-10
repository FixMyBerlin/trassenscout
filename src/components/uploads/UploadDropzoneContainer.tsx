import { twMerge } from "tailwind-merge"

type Props = {
  children: React.ReactNode
  className?: string
}

export const UploadDropzoneContainer = ({ children, className }: Props) => {
  return (
    <div className={twMerge("h-64 overflow-hidden rounded-md bg-white p-4", className)}>
      {children}
    </div>
  )
}
