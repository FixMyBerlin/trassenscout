import { useLocation } from "@tanstack/react-router"
import type { JSX } from "react"
import { PropsWithoutRef, ReactNode } from "react"
import { twJoin, twMerge } from "tailwind-merge"
import { ActionBar } from "@/src/components/core/components/forms/ActionBar"
import { BackLinkSection } from "@/src/components/core/components/forms/BackLinkSection"
import type { CoreAppFormApi } from "@/src/components/core/components/forms/coreFormTypes"
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
  actionBarLeft?: ReactNode
  actionBarRight?: ReactNode
  actionBarClassName?: string
  edgeToEdgeFooter?: ReactNode
  hideSubmitButton?: boolean
  backLink: ReactNode | null
  children: ReactNode
}

export function FormShell<TFormData>({
  form,
  formError,
  submitText,
  submitClassName,
  submitDisabled,
  actionBarLeft,
  actionBarRight,
  actionBarClassName,
  edgeToEdgeFooter,
  hideSubmitButton,
  backLink,
  className,
  children,
  ...props
}: FormShellProps<TFormData>) {
  const isHydrated = useIsHydrated()
  const { pathname } = useLocation()
  const isAdminRoute = pathname.startsWith("/admin")

  return (
    <FormHydratedProvider value={isHydrated}>
      <form.AppForm>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
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
                  {!hideSubmitButton && (
                    <form.SubmitButton
                      label={submitText}
                      className={submitClassName}
                      disabled={!isHydrated || submitDisabled}
                    />
                  )}
                  {actionBarLeft}
                </>
              }
              right={actionBarRight}
            />
          )}

          {backLink !== null && <BackLinkSection>{backLink}</BackLinkSection>}
        </form>
      </form.AppForm>
    </FormHydratedProvider>
  )
}
