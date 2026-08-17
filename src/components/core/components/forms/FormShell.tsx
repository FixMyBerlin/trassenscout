import { useLocation } from "@tanstack/react-router"
import type { JSX } from "react"
import { PropsWithoutRef, ReactNode } from "react"
import { twJoin, twMerge } from "tailwind-merge"
import { ActionBar } from "@/src/components/core/components/forms/ActionBar"
import { BackLinkSection } from "@/src/components/core/components/forms/BackLinkSection"
import type { CoreAppFormApi } from "@/src/components/core/components/forms/coreFormTypes"
import {
  type FormFieldLayout,
  formFieldLayoutLabelsOnLeftClassName,
} from "@/src/components/core/components/forms/fieldLayoutStyles"
import { FormError } from "@/src/components/core/components/forms/FormError"
import { FormHydratedProvider } from "@/src/components/core/components/forms/hooks/useFormHydrated"
import { useIsHydrated } from "@/src/components/core/components/forms/hooks/useIsHydrated"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"

export type FormShellProps<TFormData> = Omit<
  PropsWithoutRef<JSX.IntrinsicElements["form"]>,
  "onSubmit" | "children"
> & {
  form: CoreAppFormApi<TFormData>
  formError: string | null
  submitText: string
  submitClassName?: string
  submitDisabled?: boolean
  submitPlacement?: "left" | "right"
  actionBarLeft?: ReactNode
  actionBarRight?: ReactNode
  actionBarClassName?: string
  edgeToEdgeFooter?: ReactNode
  hideSubmitButton?: boolean
  backLink: ReactNode | null
  /** Default `stacked`. Pass `labelsOnLeft` to opt into the two-column grid. */
  fieldLayout?: FormFieldLayout
  children: ReactNode
}

export function FormShell<TFormData>({
  form,
  formError,
  submitText,
  submitClassName,
  submitDisabled,
  submitPlacement = "left",
  actionBarLeft,
  actionBarRight,
  actionBarClassName,
  edgeToEdgeFooter,
  hideSubmitButton,
  backLink,
  fieldLayout = "stacked",
  className,
  children,
  ...props
}: FormShellProps<TFormData>) {
  const isHydrated = useIsHydrated()
  const { pathname } = useLocation()
  const isAdminRoute = pathname.startsWith("/admin")
  const submitButton = !hideSubmitButton ? (
    <form.SubmitButton
      label={submitText}
      className={submitClassName}
      disabled={!isHydrated || submitDisabled}
    />
  ) : null
  const actionBarRightContent =
    actionBarRight || submitPlacement === "right" ? (
      <>
        {actionBarRight}
        {submitPlacement === "right" ? submitButton : null}
      </>
    ) : undefined

  return (
    <FormHydratedProvider value={isHydrated}>
      <form.AppForm>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
          className={
            fieldLayout === "labelsOnLeft" ? formFieldLayoutLabelsOnLeftClassName : undefined
          }
          {...props}
        >
          <div className={twMerge("space-y-6", pageContentPaddingClassName, className)}>
            {children}
            <FormError formError={formError} />
          </div>

          {edgeToEdgeFooter}

          {(hideSubmitButton ? Boolean(actionBarLeft || actionBarRight) : true) && (
            <ActionBar
              className={twJoin(
                isAdminRoute ? "shadow-sm ring-1 ring-gray-900/5" : "",
                actionBarClassName,
              )}
              left={
                <>
                  {submitPlacement === "left" ? submitButton : null}
                  {actionBarLeft}
                </>
              }
              right={actionBarRightContent}
            />
          )}

          {backLink !== null && <BackLinkSection>{backLink}</BackLinkSection>}
        </form>
      </form.AppForm>
    </FormHydratedProvider>
  )
}
