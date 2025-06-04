import { SurveyButton } from "@/src/app/beteiligung/_components/buttons/SurveyButton"
import { useFormContext } from "@/src/app/beteiligung/_shared/hooks/form-context"
import { ButtonHTMLAttributes } from "react"

type SubscribeButtonProps = {
  className?: string
  children: React.ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export const SubscribeButton = ({ children, className, ...props }: SubscribeButtonProps) => {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <SurveyButton {...props} disabled={isSubmitting} className={className}>
          {children}
        </SurveyButton>
      )}
    </form.Subscribe>
  )
}
