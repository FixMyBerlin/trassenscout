import { ButtonHTMLAttributes } from "react"
import { SurveyButton } from "@/src/components/beteiligung/buttons/SurveyButton"
import { useFormContext } from "@/src/components/beteiligung/shared/hooks/form-context"

type SubscribeButtonProps = {
  className?: string
  children: React.ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export const SubscribeButton = ({
  children,
  className,
  disabled,
  ...props
}: SubscribeButtonProps) => {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <SurveyButton {...props} disabled={isSubmitting || disabled} className={className}>
          {children}
        </SurveyButton>
      )}
    </form.Subscribe>
  )
}
