import { useLocation } from "@tanstack/react-router"
import { clsx } from "clsx"
import type { JSX } from "react"
import { PropsWithoutRef, ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { ActionBar } from "@/src/components/core/components/forms/ActionBar"
import type { CoreAppFormApi } from "@/src/components/core/components/forms/coreFormTypes"
import { FormError } from "@/src/components/core/components/forms/FormError"
import { FormHydratedProvider } from "@/src/components/core/components/forms/hooks/useFormHydrated"
import { useIsHydrated } from "@/src/components/core/components/forms/hooks/useIsHydrated"

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
          className={twMerge(clsx("space-y-6", className))}
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
              className={clsx(
                isAdminRoute && "shadow-sm ring-1 ring-gray-900/5",
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
