"use client"

import { ActionBar } from "@/src/core/components/forms/ActionBar"
import type { CoreAppFormApi } from "@/src/core/components/forms/coreFormTypes"
import { errorMessageTranslations } from "@/src/core/components/forms/errorMessageTranslations"
import { FormDebugOverlay } from "@/src/core/components/forms/FormDebugOverlay"
import { FormError } from "@/src/core/components/forms/FormError"
import { clsx } from "clsx"
import { PropsWithoutRef, ReactNode } from "react"
import { IntlProvider } from "react-intl"
import { twMerge } from "tailwind-merge"

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
  showFormDebug?: boolean
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
  showFormDebug,
  hideSubmitButton,
  className,
  children,
  ...props
}: FormShellProps<TFormData>) {
  return (
    <IntlProvider messages={errorMessageTranslations} locale="de" defaultLocale="de">
      <form.AppForm>
        <FormDebugOverlay enabled={showFormDebug} formError={formError} />
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
              left={
                <>
                  {!hideSubmitButton && (
                    <form.SubmitButton
                      label={submitText}
                      className={submitClassName}
                      disabled={submitDisabled}
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
    </IntlProvider>
  )
}
