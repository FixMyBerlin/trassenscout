import { useLocation } from "@tanstack/react-router"
import type { JSX } from "react"
import { PropsWithoutRef, ReactNode } from "react"
import { twJoin, twMerge } from "tailwind-merge"
import { ActionBar } from "@/src/components/core/components/forms/ActionBar"
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
  hideSubmitButton?: boolean
  /** Adds page content padding on logged-in routes. Set false for modals and embedded forms. */
  withPagePadding?: boolean
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
  hideSubmitButton,
  withPagePadding,
  className,
  children,
  ...props
}: FormShellProps<TFormData>) {
  const isHydrated = useIsHydrated()
  const { pathname } = useLocation()
  const isAdminRoute = pathname.startsWith("/admin")
  const isAuthRoute = pathname.startsWith("/auth")
  const shouldApplyPagePadding = withPagePadding ?? (!isAdminRoute && !isAuthRoute)

  return (
    <FormHydratedProvider value={isHydrated}>
      <form.AppForm>
        <form
          className={twMerge(
            "space-y-6",
            shouldApplyPagePadding && pageContentPaddingClassName,
            className,
          )}
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
          {...props}
        >
          {children}

          <FormError formError={formError} />

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
        </form>
      </form.AppForm>
    </FormHydratedProvider>
  )
}
